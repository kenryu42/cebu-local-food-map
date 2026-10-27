---
name: verify-cebu-map
description: Drive the real Cebu food & sightseeing map (宿務美食景點, a Vite + MapLibre web app) in an isolated headless Chrome at phone size and capture proof. Use to confirm a UI change works the way a colleague on a phone would use it — selecting spots, modes and filters, the 🎲 picker, share links, the converter and hotel card — or to reproduce a reported bug before fixing it.
---

# Verify the Cebu map

The app is a static site: `index.html` + `src/main.ts` render a MapLibre map with a bottom sheet (phone) or floating panel (desktop). Most users open it on phones, so the default viewport is 390×844. You drive the **production build** served by `vite preview` at the same `/cebu-local-food-map/` path GitHub Pages uses, through a dependency-free DevTools client (`scripts/drive.mjs`, Node 22+).

All scripts live in `.claude/skills/verify-cebu-map/scripts/` and take settings from the environment (defaults in `scripts/env.sh`):

| Var | Default | Meaning |
| --- | --- | --- |
| `RUN_ID` | `default` | names the run; always set it |
| `PORT` | `4174` | preview server (127.0.0.1 only) |
| `CDP_PORT` | `9333` | headless Chrome DevTools |
| `VIEWPORT` | `390,844` | `1280,900` for desktop |
| `EVIDENCE_DIR` | `artifacts/verify/$RUN_ID` | proof; gitignored; never deleted by cleanup |

`S=.claude/skills/verify-cebu-map/scripts` in the examples below, run from the repo root.

## Launch

```bash
RUN_ID=r1 $S/launch.sh                 # npm run build, then preview + headless Chrome
```

Ready when it prints `READY app=http://127.0.0.1:4174/cebu-local-food-map/ ...`. That only means both servers answer. The app is usable once the page has loaded and finished its entrance, so every journey starts with:

```bash
RUN_ID=r1 $S/drive.mjs open '/cebu-local-food-map/?skip-intro' \
  waitfor "document.body.classList.contains('ready')" 30000 settle
```

`?skip-intro` skips the one-time globe flight. There is no data to seed: places are static in `src/data.ts`; per-visitor state is only `localStorage` (intro seen, cached exchange rate, Goro photo round), which `clear-storage` wipes.

A second instance needs its own `RUN_ID`, `PORT` and `CDP_PORT`, and `SKIP_BUILD=1` so it does not rebuild `dist/` under the first one. Launch refuses a port that is already taken; never drive an instance this run did not start.

## Doctor

```bash
RUN_ID=r1 $S/doctor.sh
```

Read-only. Checks both processes are this run's, the port is owned by this run's preview, the served page is the current `dist/` build, DevTools answers, and the remote map/rate services are reachable (the map is blank without network). Run it first whenever anything looks off; exit code is non-zero on any `FAIL`.

## Drive

`drive.mjs [--geo LAT,LNG] [--console FILE] STEP...` runs steps in order in one DevTools session and prints `✔`/`✖` per step. The full step list is in the header of `scripts/drive.mjs`; the ones you need most:

| Step | Use |
| --- | --- |
| `open PATH` | `/cebu-local-food-map/...` against the preview server |
| `click CSS` | click at the element's centre; waits for it to stop moving; fails if off screen or covered (names what covers it) |
| `swipe CSS up\|down` | finger drag, for the bottom-sheet gesture |
| `type CSS TEXT` | replace a field's text |
| `wait CSS` / `gone CSS` / `waitfor JS` / `settle` | wait on observable state, not time |
| `expect JS` | assertion; fails the run |
| `text CSS` / `eval JS` | read state into the transcript |
| `screenshot FILE` | PNG under `$EVIDENCE_DIR` |
| `clear-storage` | fresh visitor |

Keep one journey in one invocation: the phone viewport, `--geo` and permission grants only last for that session (the page itself persists between invocations, at 500px wide in between). On a failed step it saves `failure-<time>.png` and exits 1.

Stable handles in this app (ids and data attributes, there are few ARIA names):

- Sheet: `#panel[data-sheet=peek|full]` (full covers the whole screen), handle `#sheet-handle`, header `.panel-header`
- Modes `.mode[data-mode=food|sight]`, area `.seg[data-area=all|mactan|cebu-city]`, chips `.chip[data-category=<id>]`, sort `.sort[data-sort=area|near]`
- List `.list-item[data-id=<place id>]`, section titles `.list-section h4`, badges `.open-badge.open|closing-soon|closed`, prices `.list-price`
- Popup `.maplibregl-popup .popup-content`, its `.maps-link`, `.share-btn`, `.nav-btn` (‹ first, › last) and `.nav-count`, close `.maplibregl-popup-close-button`
- Markers `.marker` (`.is-hidden`, `.is-active`), tools `#view-toggle`, `#reset-view`, `#hotel-btn`
- Picker `#roulette-btn`, overlay `#roulette` (`.won` when it lands), `#roulette-name`
- Tabs `.tab[data-tab=list-panel|info-panel]`; converter card `#fx-card` (opened by the actions row `#quick-fx`) with `#php-input`, `#jpy-input`, `.quick-amounts button[data-php]`, `#rate-info`; hotel card `#hotel-card` (opened by map `#hotel-btn` or the actions row `#quick-hotel`); both cards close by `swipe '.sheet-card' down`, the backdrop or Escape (no × button); toast `#toast.show`
- Place ids are in `src/data.ts` (e.g. `aa-bbq`, `pungko-fuente`, `temple-of-leah`)

For any UI change, run the layout audit in every state you touch, on both viewports:

```bash
A="$(cat $S/ui-audit.js)"
RUN_ID=r1 $S/drive.mjs open '/cebu-local-food-map/?skip-intro' waitfor "document.body.classList.contains('ready')" 30000 settle eval "$A"
```

It returns `[]` when clean, else lines for text not in Noto Sans TC (`font`), text within 8px of a button's side (`edge`), phone tap targets under 44px including any `::before` hit slop (`tap`), and text overflowing its box (`over`). It only sees what is on screen, so open the popup, cards, overlays and each scroll position of the 資訊 tab before calling it. It can't judge looks: review the screenshots too.

Recipes per feature are in [`features/`](features/README.md). Use the matching file; a proof through one convenient entry point is incomplete when the file lists others.

## Evidence

Put everything for a run under `$EVIDENCE_DIR/<feature>/`: screenshots, `--console <feature>/console.log`, and the drive transcript (`... | tee "$EVIDENCE_DIR/<feature>/drive.txt"`).

- Drive the real user path: clicks on visible controls, typed input, real URLs. Do not call app functions or set `dataset.sheet` to get somewhere.
- Capture the action and the resulting state: an `expect` on the observable result (URL hash, sheet state, list contents, toast) next to a screenshot, not a screenshot alone.
- Side effects count: the address bar hash, `localStorage` (intro seen, `cebu-food-map:php-jpy`), the clipboard after sharing.
- Mocks only at a real browser boundary: `--geo` stands in for GPS; deleting `Navigator.prototype.share` stands in for a browser without Web Share. Say so in the report.
- The app depends on live services (OpenFreeMap tiles, AWS terrain, Google Fonts, open.er-api.com). A failure there is a doctor `FAIL`, not an app bug.

## Cleanup

```bash
RUN_ID=r1 $S/cleanup.sh
```

Stops the preview server and Chrome by the pids this run recorded (never by name), deletes the run's scratch dir (`$TMPDIR/verify-cebu-map/$RUN_ID`: pids, logs, Chrome profile), and keeps `$EVIDENCE_DIR`. Run it after failed attempts too. `dist/` is a normal build output and is left alone.

## Limits

What this harness cannot prove, so report it as unverified rather than passing it:

- Real touch input and iOS Safari. Touch emulation is off because headless Chrome then drops synthetic clicks; clicks are what a tap fires, and `swipe` covers the sheet gesture, but `(hover: none)` styling and Safari quirks are not exercised.
- The native share sheet: in headless `navigator.share()` never settles, so the 🔗 分享 button hangs on that path. Only the copy-link path is drivable.
- Real GPS accuracy and permission prompts (`--geo` grants silently; without it location is denied).
