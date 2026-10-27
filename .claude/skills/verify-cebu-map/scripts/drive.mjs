#!/usr/bin/env node
// Drive the run's headless Chrome through the DevTools protocol. No dependencies (Node 22+).
//
//   RUN_ID=<id> drive.mjs [--geo LAT,LNG] [--console FILE] STEP...
//
// Steps run in order inside one DevTools session. Overrides such as --geo only last for that
// session, so keep a whole journey in one invocation. The page itself (URL, storage) persists
// between invocations.
//
//   open PATH|URL        navigate; a path starting with / is resolved against the preview server
//   wait CSS [MS]        until a visible element matches (default 15000 ms)
//   waitfor JS [MS]      until the expression is truthy
//   gone CSS [MS]        until no visible element matches
//   settle [MS]          until no one-off CSS animation or transition is running (loops ignored)
//   click CSS            click at the element's centre (what a tap fires on a phone);
//                        fails if it is off screen or something covers it
//   type CSS TEXT        click the field, replace its text by typing
//   click-text CSS TEXT  same, on the first match whose text contains TEXT (e.g. a map pin by name)
//   swipe CSS up|down    drag a finger 120px from the element's centre (touch events only)
//   key KEY              press a key (Escape, Enter, ...)
//   eval JS              print the JSON value of an expression (await allowed)
//   text CSS             print the element's innerText
//   expect JS            fail unless the expression is truthy
//   screenshot FILE      PNG; a relative FILE goes under $EVIDENCE_DIR
//   sleep MS             only for animations with no observable end state
//   clear-storage        wipe localStorage etc. for the app origin (fresh visitor)
//
// Console messages and page errors seen during the run print at the end (and go to --console FILE).
// On a failed step it saves failure-<time>.png under $EVIDENCE_DIR and exits 1.

import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = process.env.PORT ?? '4174';
const CDP_PORT = process.env.CDP_PORT ?? '9333';
// Same defaults as env.sh: <repo>/artifacts/verify/<RUN_ID>
const REPO_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../../..');
const EVIDENCE_DIR = process.env.EVIDENCE_DIR ?? join(REPO_DIR, 'artifacts/verify', process.env.RUN_ID ?? 'default');
const [VIEW_W, VIEW_H] = (process.env.VIEWPORT ?? '390,844').split(',').map(Number);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const ARITY = {
  open: 1, 'click-text': 2, swipe: 2, settle: [0, 1], wait: [1, 2], waitfor: [1, 2], gone: [1, 2], click: 1, type: 2, key: 1, eval: 1,
  text: 1, expect: 1, screenshot: 1, sleep: 1, 'clear-storage': 0
};

const args = process.argv.slice(2);
let geo = null;
let consoleFile = null;
while (args[0]?.startsWith('--')) {
  const flag = args.shift();
  if (flag === '--geo') geo = args.shift().split(',').map(Number);
  else if (flag === '--console') consoleFile = args.shift();
  else die(`unknown option ${flag}`);
}

// Group argv into steps using each verb's arity; an optional trailing number is a timeout
const steps = [];
while (args.length) {
  const verb = args.shift();
  const arity = ARITY[verb];
  if (arity === undefined) die(`unknown step "${verb}"`);
  const [min, max] = Array.isArray(arity) ? arity : [arity, arity];
  const params = args.splice(0, min);
  if (params.length < min) die(`"${verb}" needs ${min} argument(s)`);
  if (max > min && args[0] !== undefined && /^\d+$/.test(args[0])) params.push(args.shift());
  steps.push({ verb, params });
}
if (!steps.length) die('no steps given; see the header of this file');

function die(message) {
  console.error(`drive: ${message}`);
  process.exit(2);
}

const evidencePath = file => (isAbsolute(file) ? file : join(EVIDENCE_DIR, file));

// ---------- DevTools connection ----------

const targets = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`).then(r => r.json())
  .catch(() => die(`no Chrome on CDP port ${CDP_PORT}; run launch.sh (and doctor.sh)`));
// Stay on the app's tab: links such as Google Maps 導航 open new tabs in this browser
const pages = targets.filter(t => t.type === 'page');
let page = pages.find(t => t.url.startsWith(ORIGIN)) ?? pages.find(t => t.url === 'about:blank') ?? pages[0];
const others = pages.filter(t => t !== page);
if (others.length) console.log(`note: other tabs open in this run's browser: ${others.map(t => t.url).join(', ')}`);
if (!page) page = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new`, { method: 'PUT' }).then(r => r.json());

const listeners = new Set();
async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      listeners.forEach(fn => fn(msg));
    }
  };
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  return { socket, call };
}

const { socket: ws, call: send } = await connect(page.webSocketDebuggerUrl);
// Permission grants only take effect on the browser-level endpoint, not the page's
const browserUrl = (await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`).then(r => r.json())).webSocketDebuggerUrl;
const { socket: browserWs, call: browserSend } = await connect(browserUrl);

// Enabling Runtime/Log replays messages buffered from earlier loads; keep only this run's
const startedAt = Date.now();
const logs = [];
listeners.add(({ method, params }) => {
  const at = params?.timestamp ?? params?.entry?.timestamp ?? params?.exceptionDetails?.timestamp;
  if (at !== undefined && at < startedAt - 100) return;
  if (method === 'Runtime.consoleAPICalled') {
    logs.push(`[console.${params.type}] ${params.args.map(a => a.value ?? a.description ?? '').join(' ')}`);
  } else if (method === 'Runtime.exceptionThrown') {
    logs.push(`[exception] ${params.exceptionDetails.exception?.description ?? params.exceptionDetails.text}`);
  } else if (method === 'Log.entryAdded' && ['error', 'warning'].includes(params.entry.level)) {
    logs.push(`[${params.entry.level}] ${params.entry.text} ${params.entry.url ?? ''}`.trim());
  }
});

// Headless Chrome will not shrink its window below 500px, so emulate the phone screen instead.
// Emulation ends with the session; every invocation re-applies it before any step runs.
const phone = VIEW_W <= 768;
await send('Emulation.setDeviceMetricsOverride', { width: VIEW_W, height: VIEW_H, deviceScaleFactor: phone ? 2 : 1, mobile: phone });
// Touch emulation is left off on purpose: with it on, Chrome swallows synthetic mouse clicks, and
// neither Input.dispatchTouchEvent nor Input.synthesizeTapGesture produces a click in headless.
// The app acts on click, which a real tap also fires; touch-only gestures use the swipe step.
await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
// Without --geo the page sees location as denied, like a visitor who refused the prompt
await browserSend('Browser.resetPermissions');
await browserSend('Browser.grantPermissions', {
  origin: ORIGIN,
  permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite', ...(geo ? ['geolocation'] : [])]
});
if (geo) await send('Emulation.setGeolocationOverride', { latitude: geo[0], longitude: geo[1], accuracy: 20 });

async function evaluate(expression) {
  const { result, exceptionDetails } = await send('Runtime.evaluate', {
    expression, awaitPromise: true, returnByValue: true, userGesture: true
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function poll(check, timeout, what) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await check()) return;
    await sleep(150);
  }
  throw new Error(`timed out after ${timeout} ms waiting for ${what}`);
}

const visibleJs = css => `(() => {
  const el = [...document.querySelectorAll(${JSON.stringify(css)})].find(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
  return !!el;
})()`;

// Centre of the element if it is the topmost thing there, else an error naming what covers it.
// Waits for the element to stop moving first (the bottom sheet and popups slide in).
async function clickPoint(css, text = null) {
  // First rendered element matching css (and containing text, when given)
  const find = `[...document.querySelectorAll(${JSON.stringify(css)})].find(e => e.getClientRects().length && (${JSON.stringify(text)} === null || e.innerText.includes(${JSON.stringify(text)})))`;
  const rectJs = `JSON.stringify(${find}?.getBoundingClientRect() ?? null)`;
  let last = await evaluate(rectJs);
  for (let i = 0; i < 30; i++) {
    await sleep(100);
    const now = await evaluate(rectJs);
    if (now === last) break;
    last = now;
  }
  // Scroll only when needed. Centring would also scroll overflow-hidden boxes such as the map,
  // which MapLibre scrolls straight back, so the click would land beside the target.
  await evaluate(`${find}?.scrollIntoView({ block: 'nearest', inline: 'nearest' })`);
  await sleep(100);
  const point = await evaluate(`(() => {
    const el = ${find};
    if (!el) return { error: 'no visible element matches' };
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) {
      return { error: 'centre is off screen at (' + Math.round(x) + ',' + Math.round(y) + '); scroll or expand the bottom sheet first' };
    }
    const top = document.elementFromPoint(x, y);
    if (top && top !== el && !el.contains(top)) {
      return { error: 'covered by ' + top.tagName.toLowerCase() + (top.id ? '#' + top.id : '') + (top.className && typeof top.className === 'string' ? '.' + top.className.trim().split(/\\s+/).join('.') : '') };
    }
    return { x, y };
  })()`);
  if (point.error) throw new Error(`${css}${text === null ? '' : ` "${text}"`}: ${point.error}`);
  return point;
}

async function mouseClick({ x, y }) {
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
    await send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 });
  }
}

const KEYS = {
  Escape: { code: 'Escape', keyCode: 27 }, Enter: { code: 'Enter', keyCode: 13 },
  Backspace: { code: 'Backspace', keyCode: 8 }, Tab: { code: 'Tab', keyCode: 9 }
};

const run = {
  async open(target) {
    const url = target.startsWith('/') ? ORIGIN + target : target;
    const loaded = new Promise(resolve => {
      const fn = ({ method }) => { if (method === 'Page.loadEventFired') { listeners.delete(fn); resolve(); } };
      listeners.add(fn);
    });
    const { errorText } = await send('Page.navigate', { url });
    if (errorText) throw new Error(errorText);
    // A hash-only change does not fire load
    await Promise.race([loaded, sleep(new URL(url).hash ? 1500 : 30000)]);
    return url;
  },
  wait: (css, ms = 15000) => poll(() => evaluate(visibleJs(css)), Number(ms), css),
  waitfor: (js, ms = 15000) => poll(() => evaluate(js), Number(ms), js),
  settle: (ms = 10000) => poll(() => evaluate(`document.getAnimations().every(a =>
    a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity)`), Number(ms), 'animations to finish'),
  gone: (css, ms = 15000) => poll(async () => !(await evaluate(visibleJs(css))), Number(ms), `${css} to disappear`),
  async click(css) { await mouseClick(await clickPoint(css)); },
  async 'click-text'(css, text) { await mouseClick(await clickPoint(css, text)); },
  async swipe(css, direction) {
    const { x, y } = await clickPoint(css);
    const endY = y + (direction === 'up' ? -120 : 120);
    await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 6; i++) {
      await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + ((endY - y) * i) / 6 }] });
    }
    await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  },
  async type(css, text) {
    await mouseClick(await clickPoint(css));
    await evaluate(`document.querySelector(${JSON.stringify(css)}).select?.()`);
    await send('Input.insertText', { text });
  },
  async key(key) {
    const info = KEYS[key] ?? { code: key, keyCode: key.toUpperCase().charCodeAt(0) };
    const base = { key, code: info.code, windowsVirtualKeyCode: info.keyCode };
    await send('Input.dispatchKeyEvent', { type: 'keyDown', ...base });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  },
  eval: js => evaluate(js),
  text: css => evaluate(`document.querySelector(${JSON.stringify(css)})?.innerText ?? null`),
  async expect(js) {
    const value = await evaluate(js);
    if (!value) throw new Error(`expected truthy: ${js} (got ${JSON.stringify(value)})`);
    return value;
  },
  async screenshot(file) {
    const path = evidencePath(file);
    mkdirSync(dirname(path), { recursive: true });
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path, Buffer.from(data, 'base64'));
    return path;
  },
  sleep: ms => sleep(Number(ms)),
  async 'clear-storage'() {
    await send('Storage.clearDataForOrigin', { origin: ORIGIN, storageTypes: 'local_storage,session_storage,indexeddb,cache_storage' });
  }
};

let failed = false;
for (const { verb, params } of steps) {
  const label = `${verb} ${params.map(p => (p.length > 70 ? p.slice(0, 67) + '...' : p)).join(' ')}`.trim();
  try {
    const result = await run[verb](...params);
    console.log(`✔ ${label}${result === undefined ? '' : ` → ${typeof result === 'string' ? result : JSON.stringify(result)}`}`);
  } catch (error) {
    failed = true;
    console.log(`✖ ${label}\n  ${error.message}`);
    try {
      const shot = await run.screenshot(`failure-${new Date().toISOString().replace(/[:.]/g, '-')}.png`);
      console.log(`  failure screenshot: ${shot}`);
    } catch { /* page gone */ }
    break;
  }
}

if (logs.length) {
  console.log(`console (${logs.length}):\n  ${logs.join('\n  ')}`);
}
if (consoleFile) {
  const path = evidencePath(consoleFile);
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, logs.map(l => l + '\n').join(''));
}
ws.close();
browserWs.close();
process.exit(failed ? 1 : 0);
