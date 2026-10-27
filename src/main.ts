import * as maplibregl from 'maplibre-gl';
// MapLibre's stylesheet first, so style.css overrides it where both style the same element
import 'maplibre-gl/dist/maplibre-gl.css';
import './style.css';
// MapLibre finds its worker relative to its own module URL, which neither Vite's
// dev prebundle nor the production build preserves, so ship it as an asset.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Feature, LineString } from 'geojson';
import { places, glossary, phraseGroups, streetFoodTips, sources, type Place, type Category, type Area } from './data';
import { openStatus, formatPrice, shareUrl, placeIdFromHash, distanceKm, sortByDistance, type OpenStatus } from './trip';

const CATEGORY_META: Record<Category, { label: string; emoji: string; color: string }> = {
  'lechon': { label: 'Lechon 烤乳豬', emoji: '🐷', color: '#e8432e' },
  'bbq': { label: 'BBQ 燒烤', emoji: '🍢', color: '#f08c00' },
  'puso': { label: 'Puso 椰葉飯', emoji: '🍚', color: '#2f9e44' },
  'ngohiong-siomai': { label: 'Ngohiong/Siomai', emoji: '🥟', color: '#c2850c' },
  'local-dish': { label: '在地家常菜', emoji: '🍲', color: '#e64980' },
  'michelin': { label: '米其林必比登', emoji: '🍽️', color: '#364fc7' },
  'market': { label: '市場', emoji: '🏪', color: '#7048e8' },
  'history': { label: '歷史古蹟', emoji: '🏛️', color: '#a0522d' },
  'temple': { label: '教堂寺廟', emoji: '⛪', color: '#1c7ed6' },
  'viewpoint': { label: '山景拍照', emoji: '🌄', color: '#d6336c' },
  'lodging': { label: '住宿', emoji: '🏨', color: '#0c8599' },
  'airport': { label: '機場', emoji: '✈️', color: '#495057' }
};
type Mode = 'food' | 'sight';
const MODES: Record<Mode, { categories: Category[]; pick: string; tour: string; empty: string; burst: string[] }> = {
  food: {
    categories: ['michelin', 'lechon', 'bbq', 'ngohiong-siomai', 'local-dish', 'puso', 'market'],
    pick: '今晚吃什麼？',
    tour: '美食巡禮',
    empty: '沒有符合的店家，換個篩選試試 🍽️',
    burst: ['🐷', '🍢', '🍚', '🥟', '🦐', '🥥', '🥭', '🔥', '🌴', '✨']
  },
  sight: {
    categories: ['history', 'temple', 'viewpoint'],
    pick: '去哪裡玩？',
    tour: '景點巡禮',
    empty: '沒有符合的景點，換個篩選試試 📸',
    burst: ['⛪', '🏛️', '🌄', '🌺', '📸', '🌴', '🗿', '✨']
  }
};
const OPEN_LABEL: Record<OpenStatus, string> = { 'open': '營業中', 'closing-soon': '即將打烊', 'closed': '休息中' };

const JAPAN: [number, number] = [139.7, 35.68];
const HOME = { pitch: 50, bearing: -12 };
const jpark = places.find(p => p.id === 'jpark')!;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileQuery = window.matchMedia('(max-width: 768px)');

// The globe flight pulls map tiles for every view on the way, so only play it once,
// and never on Data Saver or slow (roaming) connections.
const INTRO_SEEN_KEY = 'cebu-food-map:intro-seen';
const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
const slowNetwork = Boolean(connection?.saveData) || /2g/.test(connection?.effectiveType ?? '');
function introSeen(): boolean {
  try { return localStorage.getItem(INTRO_SEEN_KEY) === '1'; } catch { return false; }
}
// A shared link (#place=…) goes straight to that place instead of playing the intro
const sharedPlaceId = placeIdFromHash(location.hash, places.map(p => p.id));
const playFlight = !sharedPlaceId && !reducedMotion && !slowNetwork && !introSeen() && !new URLSearchParams(location.search).has('skip-intro');

// PHP→JPY rate on 2026-10-27 (open.er-api.com); replaced by a newer cached or live rate
const RATE_KEY = 'cebu-food-map:php-jpy';
interface Rate { value: number; date: string }
let rate: Rate = { value: 2.463, date: '2026-10-27' };
try {
  const cached = JSON.parse(localStorage.getItem(RATE_KEY) ?? 'null') as Rate | null;
  if (cached && cached.date > rate.date) rate = cached;
} catch { /* no storage: keep the built-in rate */ }

maplibregl.setWorkerUrl(workerUrl);

// State
let map: maplibregl.Map;
const markers = new Map<string, maplibregl.Marker>();
// 320px fits a 390px phone with the map's 16px gutters on both sides; buttons need the width
// Subpixel positioning: while the camera orbits, the pin's projected point hovers on a half
// pixel, and rounding it made the popup and pin flicker 1px back and forth every frame
const popup = new maplibregl.Popup({ offset: [0, -48], maxWidth: 'min(320px, calc(100vw - 32px))', focusAfterOpen: false, subpixelPositioning: true });
let mode: Mode = 'food';
let activeArea: Area | 'all' = 'all';
const activeCategories = new Set<Category>();
let activeId: string | null = null;
let is3D = true;
let selection = 0; // bumps on every new selection so stale flights don't open popups
let orbitFrame = 0;
let tourRunning = false;
let sortMode: 'area' | 'near' = 'area';
let userPos: { lat: number; lng: number } | null = null;

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const primary = (place: Place) => CATEGORY_META[place.categories[0]];
const isSpot = (place: Place) => place.area !== 'landmark';
const modeOf = (place: Place): Mode => place.categories.some(c => MODES.sight.categories.includes(c)) ? 'sight' : 'food';
// Landmarks (hotel, airport) show in both modes
const inMode = (place: Place) => !isSpot(place) || modeOf(place) === mode;
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const distanceFromJpark = (place: Place) => distanceKm(jpark, place);

let toastTimer = 0;
function toast(message: string) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2400);
}

function openBadge(place: Place): string {
  if (!place.openHours) return '';
  const status = openStatus(place.openHours, new Date());
  return `<span class="open-badge ${status}" data-open-id="${place.id}">${OPEN_LABEL[status]}</span>`;
}

// Badges go stale as the clock moves; update them in place without re-rendering the list
function refreshOpenBadges() {
  document.querySelectorAll<HTMLElement>('[data-open-id]').forEach(el => {
    const place = places.find(p => p.id === el.dataset.openId);
    if (!place?.openHours) return;
    const status = openStatus(place.openHours, new Date());
    el.className = `open-badge ${status}`;
    el.textContent = OPEN_LABEL[status];
  });
}

type SheetState = 'peek' | 'full';
let sheetState: SheetState = 'peek';

// Visible height of the collapsed bottom sheet; mirrors --sheet-peek in style.css
const SHEET_PEEK = 168;

// Keep the camera's focus clear of the bottom sheet (phone) or floating panel (desktop).
// Computed from state, not measured, so it is right while the sheet is still sliding.
// When a name wraps, break between words, never inside one: keep a （parenthesised part）,
// a hyphenated word like Lapu-Lapu and a run of Chinese characters each on one line
const nobr = (text: string) => `<span class="nobr">${text}</span>`;
const keepWordsWhole = (name: string) => name
  .split(/([（(][^）)]*[）)])/)
  .map((part, i) => i % 2 ? nobr(part) : part.replace(/\S+-\S+|[\u4e00-\u9fff]+/g, nobr))
  .join('');

function cameraPadding(): maplibregl.PaddingOptions {
  if (mobileQuery.matches) {
    // A full sheet covers the map, so always frame it for the collapsed sheet
    return { top: 90, bottom: SHEET_PEEK + 16, left: 24, right: 24 };
  }
  return { top: 80, bottom: 80, left: 460, right: 90 };
}

function flyAndWait(options: maplibregl.FlyToOptions & { padding?: maplibregl.PaddingOptions }): Promise<void> {
  if (reducedMotion) {
    map.jumpTo(options);
    return Promise.resolve();
  }
  // Start the flight before listening: starting it ends any flight in progress, and that
  // flight's moveend must not count as this one landing
  map.flyTo(options);
  if (!map.isMoving()) return Promise.resolve(); // nothing to animate, so it already landed
  return new Promise(resolve => map.once('moveend', () => resolve()));
}

// Initialize map
function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    center: playFlight ? JAPAN : [123.955, 10.302],
    zoom: playFlight ? 2.2 : 11,
    maxPitch: 75,
    attributionControl: false
  });
  // #map is position: fixed, so it is its own stacking context; the tools join it so a
  // popup can stack above them rather than behind
  map.getContainer().append($('.map-tools'));

  map.setStyle('https://tiles.openfreemap.org/styles/liberty', {
    transformStyle: (_previous, style) => ({
      ...style,
      layers: style.layers.map(layer => {
        // Road-shield filters compare ref_length <= 6, which warns on roads that have no ref
        const filter = 'filter' in layer ? JSON.stringify(layer.filter) : '';
        if (!filter.includes('["<=",["get","ref_length"],6]')) return layer;
        return {
          ...layer,
          filter: JSON.parse(filter.replace('["get","ref_length"]', '["to-number",["coalesce",["get","ref_length"],99]]'))
        };
      })
    })
  });

  // The style references a few POI icons its sprite doesn't ship; draw them as nothing
  map.setMissingStyleImageResolver(id => {
    if (!map.hasImage(id)) map.addImage(id, { width: 1, height: 1, data: new Uint8Array(4) });
  });

  // Phones pinch to zoom; the compass alone is enough to reset rotation there
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showZoom: !mobileQuery.matches }), 'top-right');
  const geolocate = new maplibregl.GeolocateControl({ trackUserLocation: true });
  geolocate.on('geolocate', ({ coords }) => {
    userPos = { lat: coords.latitude, lng: coords.longitude };
    if (sortMode === 'near') updateList();
  });
  map.addControl(geolocate, 'top-right');
  // Top corner, because the bottom sheet covers the bottom of the map on phones
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-right');
  
  map.on('load', () => {
    // Compact attribution starts expanded; keep it collapsed to the ⓘ button
    document.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
    map.setProjection({ type: 'globe' });
    map.setSky({ 'sky-color': '#7cc6f2', 'horizon-color': '#ffe8cc', 'fog-color': '#fff4e6', 'sky-horizon-blend': 0.6, 'atmosphere-blend': 0.8 });

    map.addSource('terrain-source', {
      type: 'raster-dem',
      tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom: 14
    });

    // Warm, sunlit buildings instead of the default grey
    map.setPaintProperty('building-3d', 'fill-extrusion-color', [
      'interpolate', ['linear'], ['get', 'render_height'],
      0, '#f6e7d4', 25, '#f2c99d', 70, '#ee9a63', 150, '#e8684a'
    ]);
    map.setPaintProperty('building-3d', 'fill-extrusion-opacity', 0.9);

    map.addSource('route', { type: 'geojson', data: lineFeature([]) });
    map.addLayer({
      id: 'route-glow', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ff5a36', 'line-width': 12, 'line-opacity': 0.18, 'line-blur': 6 }
    });
    map.addLayer({
      id: 'route-line', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ff5a36', 'line-width': 3.5, 'line-dasharray': [0.1, 2] }
    });

    addMarkers();
    updateList();
    playIntro();
  });

  // Any hands-on interaction hands the camera back to the user
  for (const type of ['mousedown', 'touchstart', 'wheel'] as const) {
    map.on(type, () => {
      stopOrbit();
      if (tourRunning) stopTour();
    });
  }
}

// Camera that frames every visible spot (plus J Park) on this screen size
function overviewCamera(): maplibregl.CameraOptions {
  const visible = getFilteredPlaces().filter(isSpot);
  const bounds = new maplibregl.LngLatBounds();
  visible.forEach(p => bounds.extend([p.lng, p.lat]));
  if (visible.length === 0 || activeArea !== 'cebu-city') bounds.extend([jpark.lng, jpark.lat]);
  const pitch = is3D ? HOME.pitch : 0;
  const bearing = is3D ? HOME.bearing : 0;
  // absolutePadding: replace the padding the last spot selection left on the map instead of adding
  // to it; stacked, the two overflow a phone screen and the camera never moves
  const camera = map.cameraForBounds(bounds, { padding: cameraPadding(), absolutePadding: true, pitch, bearing, maxZoom: 14.5 });
  return { ...camera, pitch, bearing };
}

// ---------- Intro: fly from Japan down to Cebu ----------

async function playIntro() {
  const intro = $('#intro');
  if (!playFlight) {
    map.jumpTo(overviewCamera());
    finishIntro();
    return;
  }

  let skipped = false;
  intro.addEventListener('click', () => {
    skipped = true;
    map.stop();
    map.jumpTo(overviewCamera());
    finishIntro();
  }, { once: true });

  intro.classList.add('playing');
  await wait(900);
  if (skipped) return;
  animateRoute(JAPAN, [jpark.lng, jpark.lat], 5200, 0.18);
  await flyAndWait({ ...overviewCamera(), duration: 7000, curve: 1.6, essential: true });
  if (!skipped) finishIntro();
}

function finishIntro() {
  // Only a flight that actually played counts as seen; a shared link or reduced motion skips it
  // without spending the one-time intro
  if (playFlight) {
    try { localStorage.setItem(INTRO_SEEN_KEY, '1'); } catch { /* private mode: replay next time */ }
  }
  $('#intro').classList.add('done');
  document.body.classList.add('ready');
  // The globe is only for the flight in; terrain doesn't support it, so go flat before adding terrain
  map.setProjection({ type: 'mercator' });
  map.setTerrain({ source: 'terrain-source', exaggeration: 1.3 });
  clearRoute();
  updateMarkers();
  if (sharedPlaceId) selectPlace(sharedPlaceId);
}

// ---------- Route arc from J Park ----------

function lineFeature(coordinates: [number, number][]): Feature<LineString> {
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } };
}

function arcPoints(from: [number, number], to: [number, number], bend: number): [number, number][] {
  const [x1, y1] = from;
  const [x2, y2] = to;
  // Quadratic bezier with the control point pushed sideways off the midpoint
  const cx = (x1 + x2) / 2 - (y2 - y1) * bend;
  const cy = (y1 + y2) / 2 + (x2 - x1) * bend;
  const points: [number, number][] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const u = 1 - t;
    points.push([u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2]);
  }
  return points;
}

let routeFrame = 0;
function animateRoute(from: [number, number], to: [number, number], duration: number, bend = 0.3) {
  const source = map.getSource<maplibregl.GeoJSONSource>('route');
  if (!source) return;
  cancelAnimationFrame(routeFrame);
  const points = arcPoints(from, to, bend);
  if (reducedMotion) {
    source.setData(lineFeature(points));
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    source.setData(lineFeature(points.slice(0, Math.max(2, Math.ceil(eased * points.length)))));
    if (t < 1) routeFrame = requestAnimationFrame(step);
  };
  routeFrame = requestAnimationFrame(step);
}

function clearRoute() {
  cancelAnimationFrame(routeFrame);
  map.getSource<maplibregl.GeoJSONSource>('route')?.setData(lineFeature([]));
}

// ---------- Camera orbit around the selected place ----------

function startOrbit() {
  if (reducedMotion || !is3D) return;
  stopOrbit();
  let last = performance.now();
  const step = (now: number) => {
    map.setBearing(map.getBearing() + (now - last) * 0.004);
    last = now;
    orbitFrame = requestAnimationFrame(step);
  };
  orbitFrame = requestAnimationFrame(step);
}

function stopOrbit() {
  cancelAnimationFrame(orbitFrame);
  orbitFrame = 0;
}

// ---------- Markers ----------

function createMarkerElement(place: Place): HTMLElement {
  const meta = primary(place);
  const el = document.createElement('div');
  el.className = 'marker is-hidden';
  el.style.setProperty('--c', meta.color);
  el.innerHTML = `
    <div class="marker-pin"><span>${meta.emoji}</span></div>
    <div class="marker-label">${place.name}</div>
  `;
  el.addEventListener('click', e => {
    e.stopPropagation();
    selectPlace(place.id);
  });
  el.addEventListener('mouseenter', () => setHover(place.id, true));
  el.addEventListener('mouseleave', () => setHover(place.id, false));
  return el;
}

function addMarkers() {
  places.forEach(place => {
    const marker = new maplibregl.Marker({ element: createMarkerElement(place), anchor: 'bottom', subpixelPositioning: true })
      .setLngLat([place.lng, place.lat])
      .addTo(map);
    markers.set(place.id, marker);
  });
}

function updateMarkers() {
  const visible = new Set(getFilteredPlaces().map(p => p.id));
  let order = 0;
  markers.forEach((marker, id) => {
    const el = marker.getElement();
    const show = visible.has(id);
    if (show && el.classList.contains('is-hidden')) el.style.setProperty('--delay', `${order++ * 45}ms`);
    el.classList.toggle('is-hidden', !show);
  });
}

function setHover(id: string, on: boolean) {
  markers.get(id)?.getElement().classList.toggle('is-hover', on);
  document.querySelector(`.list-item[data-id="${id}"]`)?.classList.toggle('is-hover', on);
}

// ---------- Selecting a place ----------

function createPopupContent(place: Place): string {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.googleQuery)}`;
  const tags = place.categories
    .map(c => `<span class="tag" style="--c:${CATEGORY_META[c].color}">${CATEGORY_META[c].emoji} ${CATEGORY_META[c].label}</span>`)
    .join('');
  const distance = place.id === 'jpark' ? '' : `<p class="info">📍 距離 J Park ${distanceFromJpark(place).toFixed(1)} km${place.distance ? `（${place.distance}）` : ''}</p>`;
  const fromYou = userPos ? `<p class="info">🚶 離你 ${distanceKm(userPos, place).toFixed(1)} km</p>` : '';

  return `
    <div class="popup-content">
      <div class="tags">${tags}</div>
      <h3>${keepWordsWhole(place.name)} ${openBadge(place)}</h3>
      ${place.recommended ? `<p class="recommended">${place.recommended}</p>` : ''}
      ${place.hours ? `<p class="info">⏰ ${place.hours}</p>` : ''}
      ${place.price ? `<p class="info">💰 ${formatPrice(place.price, rate.value)}</p>` : ''}
      ${distance}
      ${fromYou}
      <div class="popup-actions">
        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="maps-link">🧭 Google Maps 導航</a>
        <button class="share-btn" aria-label="分享這個地點">🔗 分享</button>
      </div>
      ${place.coordinateSource === 'approximate' ? `<p class="coord-note">⚠️ 座標為區域參考位置</p>` : ''}
    </div>
  `;
}

function showPopup(place: Place) {
  popup.setLngLat([place.lng, place.lat]).setHTML(createPopupContent(place)).addTo(map);
  popup.getElement().querySelector('.share-btn')!.addEventListener('click', () => sharePlace(place));
}

async function sharePlace(place: Place) {
  const url = shareUrl(location.href, place.id);
  if (navigator.share) {
    try {
      await navigator.share({ title: place.name, text: `${place.name}｜宿務美食景點`, url });
      return;
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') return; // user closed the share sheet
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast('已複製連結，貼到群組吧 ✅');
  } catch {
    toast('無法複製，請手動複製網址列');
  }
}

// Keep the address bar pointing at the open place so it can be copied as-is
function setUrlPlace(id: string | null) {
  const url = id ? shareUrl(location.href, id) : location.href.split('#')[0];
  history.replaceState(null, '', url);
}

async function selectPlace(id: string, { orbit = true } = {}) {
  const place = places.find(p => p.id === id);
  if (!place) return;
  const token = ++selection;

  stopOrbit();
  popup.remove();
  if (isSpot(place) && modeOf(place) !== mode) setMode(modeOf(place));
  setActive(id);
  setUrlPlace(id);
  if (mobileQuery.matches) setSheet('peek');

  if (place.id !== 'jpark') animateRoute([jpark.lng, jpark.lat], [place.lng, place.lat], 1400);
  else clearRoute();

  await flyAndWait({
    center: [place.lng, place.lat],
    zoom: 16.2,
    pitch: is3D ? 62 : 0,
    bearing: is3D ? map.getBearing() - 40 : 0,
    // Extra headroom on phones so the popup above the pin clears the map buttons
    padding: mobileQuery.matches ? { ...cameraPadding(), top: 330 } : cameraPadding(),
    duration: 2600,
    curve: 1.4,
    essential: true
  });
  if (token !== selection) return;

  showPopup(place);
  if (orbit) startOrbit();
}

function setActive(id: string | null) {
  activeId = id;
  markers.forEach((marker, markerId) => marker.getElement().classList.toggle('is-active', markerId === id));
  document.querySelectorAll('.list-item').forEach(item => {
    const match = item.getAttribute('data-id') === id;
    item.classList.toggle('is-active', match);
    if (match) item.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
  });
}

function clearSelection() {
  selection++;
  stopOrbit();
  popup.remove();
  clearRoute();
  setActive(null);
  setUrlPlace(null);
}

popup.on('close', () => {
  stopOrbit();
  if (activeId) {
    clearRoute();
    setActive(null);
    setUrlPlace(null);
  }
});

window.addEventListener('hashchange', () => {
  const id = placeIdFromHash(location.hash, places.map(p => p.id));
  if (id && id !== activeId) selectPlace(id);
});

// ---------- Filters ----------

function placesInArea(): Place[] {
  return places.filter(p => inMode(p) && (p.area === 'landmark' || activeArea === 'all' || p.area === activeArea));
}

function getFilteredPlaces(): Place[] {
  return placesInArea().filter(place =>
    place.area === 'landmark' ||
    activeCategories.size === 0 ||
    place.categories.some(cat => activeCategories.has(cat))
  );
}

function applyFilters({ refit = false } = {}) {
  updateMarkers();
  updateList();
  updateChips();
  if (activeId && !getFilteredPlaces().some(p => p.id === activeId)) clearSelection();
  if (refit) fitToVisible();
}

function fitToVisible() {
  stopOrbit();
  map.flyTo({ ...overviewCamera(), duration: reducedMotion ? 0 : 1800, essential: true });
}

function initFilters() {
  document.querySelectorAll<HTMLButtonElement>('.seg').forEach(btn => {
    btn.addEventListener('click', () => {
      activeArea = btn.dataset.area as Area | 'all';
      document.querySelectorAll('.seg').forEach(b => b.classList.toggle('active', b === btn));
      clearSelection();
      applyFilters({ refit: true });
    });
  });

  $('#category-chips').addEventListener('click', e => {
    const chip = (e.target as HTMLElement).closest<HTMLButtonElement>('.chip');
    if (!chip) return;
    const cat = chip.dataset.category as Category;
    if (activeCategories.has(cat)) activeCategories.delete(cat);
    else activeCategories.add(cat);
    applyFilters();
  });

  document.querySelectorAll<HTMLButtonElement>('.mode').forEach(btn => {
    btn.addEventListener('click', () => {
      if (tourRunning) stopTour();
      clearSelection();
      setMode(btn.dataset.mode as Mode);
      // On phones, open the sheet fully so the mode's list is what the visitor sees
      if (mobileQuery.matches) setSheet('full');
      applyFilters({ refit: true });
    });
  });

  renderModeControls();
}

function setMode(next: Mode) {
  if (next === mode) return;
  mode = next;
  activeCategories.clear();
  renderModeControls();
  updateMarkers();
  updateList();
}

function renderModeControls() {
  document.querySelectorAll<HTMLButtonElement>('.mode').forEach(btn => {
    const on = btn.dataset.mode === mode;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-checked', String(on));
  });
  $('#roulette-btn').textContent = `🎲 ${MODES[mode].pick}`;
  $('#roulette-label').textContent = MODES[mode].pick;
  $('#tour-btn').textContent = `▶ ${MODES[mode].tour}`;
  $('#category-chips').innerHTML = MODES[mode].categories.map(cat => `
    <button class="chip" data-category="${cat}" style="--c:${CATEGORY_META[cat].color}">
      <span>${CATEGORY_META[cat].emoji} ${CATEGORY_META[cat].label}</span><b class="chip-count"></b>
    </button>
  `).join('');
  updateChips();
}

function updateChips() {
  const inArea = placesInArea().filter(isSpot);
  document.querySelectorAll<HTMLButtonElement>('.chip').forEach(chip => {
    const cat = chip.dataset.category as Category;
    chip.classList.toggle('active', activeCategories.has(cat));
    chip.querySelector('.chip-count')!.textContent = String(inArea.filter(p => p.categories.includes(cat)).length);
  });
}

// ---------- List ----------

function createListItem(place: Place, index: number): string {
  const meta = primary(place);
  const distance = sortMode === 'near' && userPos
    ? `<span>🚶 離你 ${distanceKm(userPos, place).toFixed(1)} km</span>`
    : place.id === 'jpark' ? '' : `<span>📍 ${distanceFromJpark(place).toFixed(1)} km</span>`;
  return `
    <button class="list-item${place.id === activeId ? ' is-active' : ''}" data-id="${place.id}" style="--c:${meta.color};--i:${index}">
      <span class="list-badge">${meta.emoji}</span>
      <span class="list-text">
        <span class="list-item-name">${keepWordsWhole(place.name)} ${openBadge(place)}</span>
        ${place.recommended ? `<span class="list-item-desc">${place.recommended}</span>` : ''}
        <span class="list-meta">${place.hours ? `<span>⏰ ${place.hours}</span>` : ''}${distance}</span>
        ${place.price ? `<span class="list-price">💰 ${formatPrice(place.price, rate.value)}</span>` : ''}
      </span>
    </button>
  `;
}

function updateList() {
  const filtered = getFilteredPlaces();
  const groups: [string, Place[]][] = sortMode === 'near' && userPos
    ? [['離你最近', sortByDistance(filtered, userPos)]]
    : [
      ['麥克坦島', filtered.filter(p => p.area === 'mactan')],
      ['宿務市區', filtered.filter(p => p.area === 'cebu-city')],
      ['地標', filtered.filter(p => p.area === 'landmark')]
    ];

  let index = 0;
  $('#place-list').innerHTML = groups
    .filter(([, group]) => group.length > 0)
    .map(([title, group]) => `
      <div class="list-section"><h4>${title}</h4><span>${group.length}</span></div>
      ${group.map(place => createListItem(place, index++)).join('')}
    `).join('') || `<p class="empty">${MODES[mode].empty}</p>`;

  document.querySelectorAll<HTMLElement>('.list-item').forEach(item => {
    const id = item.dataset.id!;
    item.addEventListener('click', () => {
      if (tourRunning) stopTour();
      selectPlace(id);
    });
    item.addEventListener('mouseenter', () => setHover(id, true));
    item.addEventListener('mouseleave', () => setHover(id, false));
  });
}

// ---------- 🎲 Roulette ----------

async function spinRoulette() {
  const pool = getFilteredPlaces().filter(isSpot);
  if (pool.length === 0) return;
  if (tourRunning) stopTour();
  clearSelection();

  const winner = pool[Math.floor(Math.random() * pool.length)];
  const overlay = $('#roulette');
  const nameEl = $('#roulette-name');
  const descEl = $('#roulette-desc');
  const btn = $<HTMLButtonElement>('#roulette-btn');
  btn.disabled = true;
  overlay.hidden = false;
  overlay.classList.remove('won');
  descEl.textContent = '';

  const ticks = reducedMotion ? 1 : 22;
  const startIndex = Math.floor(Math.random() * pool.length);
  for (let i = 0; i < ticks; i++) {
    // Land exactly on the winner at the final tick
    const place = i === ticks - 1 ? winner : pool[(startIndex + i) % pool.length];
    nameEl.textContent = `${primary(place).emoji} ${place.name}`;
    nameEl.classList.remove('tick');
    void nameEl.offsetWidth;
    nameEl.classList.add('tick');
    markers.forEach((m, id) => m.getElement().classList.toggle('is-hover', id === place.id));
    if (i < ticks - 1) await wait(45 + i * i * 1.1);
  }

  overlay.classList.add('won');
  descEl.textContent = winner.recommended ?? '';
  burst();
  await wait(reducedMotion ? 600 : 1500);

  overlay.hidden = true;
  btn.disabled = false;
  markers.forEach(m => m.getElement().classList.remove('is-hover'));
  selectPlace(winner.id);
}

function burst() {
  if (reducedMotion) return;
  const container = $('#burst');
  for (let i = 0; i < 34; i++) {
    const span = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const dist = 140 + Math.random() * 260;
    const emoji = MODES[mode].burst;
    span.textContent = emoji[i % emoji.length];
    span.style.setProperty('--x', `${Math.cos(angle) * dist}px`);
    span.style.setProperty('--y', `${Math.sin(angle) * dist - 80}px`);
    span.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    span.style.setProperty('--s', `${0.8 + Math.random() * 0.9}`);
    span.style.animationDelay = `${Math.random() * 120}ms`;
    container.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }
}

// ---------- ▶ Tour ----------

async function startTour() {
  const stops = getFilteredPlaces().filter(isSpot);
  if (stops.length === 0) return;
  clearSelection();
  tourRunning = true;
  $('#tour-bar').hidden = false;
  document.body.classList.add('touring');

  for (let i = 0; i < stops.length && tourRunning; i++) {
    $('#tour-progress').textContent = `${MODES[mode].tour} ${i + 1}/${stops.length} · ${stops[i].name}`;
    await selectPlace(stops[i].id, { orbit: false });
    if (!tourRunning) return;
    startOrbit();
    await wait(4200);
  }
  if (tourRunning) {
    stopTour();
    clearSelection();
    fitToVisible();
  }
}

function stopTour() {
  tourRunning = false;
  stopOrbit();
  $('#tour-bar').hidden = true;
  document.body.classList.remove('touring');
}

// ---------- View controls ----------

function initViewControls() {
  const toggle = $('#view-toggle');
  toggle.addEventListener('click', () => {
    is3D = !is3D;
    toggle.textContent = is3D ? '2D' : '3D';
    map.setLayoutProperty('building-3d', 'visibility', is3D ? 'visible' : 'none');
    if (is3D) map.setTerrain({ source: 'terrain-source', exaggeration: 1.3 });
    else map.setTerrain(null);
    stopOrbit();
    map.easeTo({ pitch: is3D ? 60 : 0, bearing: is3D ? map.getBearing() - 20 : 0, duration: reducedMotion ? 0 : 1200 });
  });

  $('#reset-view').addEventListener('click', () => {
    if (tourRunning) stopTour();
    clearSelection();
    fitToVisible();
  });

  $('#roulette-btn').addEventListener('click', spinRoulette);
  $('#tour-btn').addEventListener('click', () => (tourRunning ? stopTour() : startTour()));
  $('#tour-stop').addEventListener('click', stopTour);
}

// ---------- Mobile bottom sheet ----------

function setSheet(state: SheetState) {
  sheetState = state;
  $('#panel').dataset.sheet = state;
}

function initSheet() {
  const panel = $('#panel');
  setSheet('peek');
  $('#sheet-handle').addEventListener('click', () => setSheet(sheetState === 'peek' ? 'full' : 'peek'));

  let startY = 0;
  const header = panel.querySelector<HTMLElement>('.panel-header')!;
  for (const el of [$('#sheet-handle'), header]) {
    el.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dy) < 40) return;
      setSheet(dy < 0 ? 'full' : 'peek');
    });
  }
}

// ---------- Sort by distance from me ----------

function initSort() {
  document.querySelectorAll<HTMLButtonElement>('.sort').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.sort as 'area' | 'near';
      if (next === 'area') return applySort('area');
      if (!navigator.geolocation) return toast('這支手機不支援定位');
      btn.classList.add('loading');
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          btn.classList.remove('loading');
          userPos = { lat: coords.latitude, lng: coords.longitude };
          applySort('near');
        },
        () => {
          btn.classList.remove('loading');
          toast('拿不到你的位置，請允許定位後再試一次');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  });
}

function applySort(next: 'area' | 'near') {
  sortMode = next;
  document.querySelectorAll<HTMLButtonElement>('.sort').forEach(b => b.classList.toggle('active', b.dataset.sort === next));
  updateList();
  $('.panel-body').scrollTo({ top: 0 });
}

// ---------- Peso ⇄ yen ----------

function initConverter() {
  const php = $<HTMLInputElement>('#php-input');
  const jpy = $<HTMLInputElement>('#jpy-input');
  const parse = (value: string) => Number(value.replace(/[^\d.]/g, ''));

  const fromPhp = () => {
    const amount = parse(php.value);
    jpy.value = php.value.trim() && amount >= 0 ? String(Math.round(amount * rate.value)) : '';
  };
  const fromJpy = () => {
    const amount = parse(jpy.value);
    const pesos = amount / rate.value;
    php.value = jpy.value.trim() && amount >= 0 ? (pesos >= 100 ? String(Math.round(pesos)) : pesos.toFixed(1)) : '';
  };

  php.addEventListener('input', fromPhp);
  jpy.addEventListener('input', fromJpy);
  document.querySelectorAll<HTMLButtonElement>('.quick-amounts button').forEach(btn => {
    btn.addEventListener('click', () => {
      php.value = btn.dataset.php!;
      fromPhp();
    });
  });
  renderRate();
  refreshRate().then(fromPhp);
}

function renderRate() {
  const [, month, day] = rate.date.split('-');
  $('#rate-info').textContent = `₱1 ≈ ¥${rate.value.toFixed(2)}（${Number(month)}/${Number(day)} 匯率，實際以兌換處為準）`;
}

// Fetch today's rate; on failure keep the cached or built-in one so it still works offline
async function refreshRate() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/PHP');
    const data = await response.json() as { result: string; time_last_update_unix: number; rates: { JPY: number } };
    if (data.result !== 'success') return;
    const date = new Date(data.time_last_update_unix * 1000).toISOString().slice(0, 10);
    if (date < rate.date) return;
    rate = { value: data.rates.JPY, date };
    try { localStorage.setItem(RATE_KEY, JSON.stringify(rate)); } catch { /* not persisted; fine for this visit */ }
    renderRate();
    updateList();
    const open = activeId && popup.isOpen() ? places.find(p => p.id === activeId) : undefined;
    if (open) showPopup(open);
  } catch {
    /* offline: the shown rate's date tells people how old it is */
  }
}

// ---------- Hotel & emergency card ----------

function initHotelCard() {
  const modal = $('#hotel-card');
  const card = modal.querySelector<HTMLElement>('.hotel-card')!;
  const close = () => {
    modal.hidden = true;
    card.style.transition = card.style.transform = '';
  };
  for (const btn of [$('#hotel-btn'), $('#quick-hotel')]) btn.addEventListener('click', () => { modal.hidden = false; });
  $('#hotel-close').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });

  // Swipe down to dismiss: the card follows the finger, closes past 80px, else springs back.
  // Only from the top of the card, so dragging down inside scrolled content still scrolls.
  let startY = 0;
  let dy = 0;
  let dragging = false;
  card.addEventListener('touchstart', e => {
    dragging = card.scrollTop <= 0;
    startY = e.touches[0].clientY;
    dy = 0;
  }, { passive: true });
  card.addEventListener('touchmove', e => {
    if (!dragging) return;
    dy = Math.max(0, e.touches[0].clientY - startY);
    if (!dy) return;
    e.preventDefault(); // no page bounce while the card is held
    card.style.transition = 'none';
    card.style.transform = `translateY(${dy}px)`;
  }, { passive: false });
  card.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    if (dy <= 80) {
      card.style.transition = 'transform 0.3s var(--ease-out)';
      card.style.transform = '';
      return;
    }
    if (reducedMotion) return close();
    card.style.transition = 'transform 0.25s ease-in';
    card.style.transform = 'translateY(100%)';
    card.addEventListener('transitionend', close, { once: true });
  });
}

// ---------- Info panel & tabs ----------

function initInfoPanel() {
  $('#phrases-content').innerHTML = phraseGroups.map(group => `
    <h5 class="phrase-group">${group.title}</h5>
    ${group.phrases.map(item => `
      <button class="phrase" data-phrase-id="${item.id}" aria-label="播放 ${item.phrase} 的發音">
        <strong><span class="speaker" aria-hidden="true">🔊</span>${item.phrase}</strong><span>${item.meaning}</span>
      </button>
    `).join('')}
  `).join('');
  initPhraseAudio();

  $('#glossary-content').innerHTML = glossary.map(item => `
    <div class="glossary-item"><strong>${item.term}</strong><span>${item.description}</span></div>
  `).join('');

  $('#tips-content').innerHTML = '<ul>' + streetFoodTips.map(tip => `<li>${tip}</li>`).join('') + '</ul>';

  $('#sources-content').innerHTML = sources.map(source => `
    <a class="source-link" href="${source.url}" target="_blank" rel="noopener noreferrer">
      ${source.title} <span class="source-site">${source.site} ↗</span>
    </a>
  `).join('');
}

// One player for all phrases: a new tap stops the previous clip, a repeat tap replays from the start
function initPhraseAudio() {
  const player = new Audio();
  let playing: HTMLElement | null = null;
  const stop = () => {
    playing?.classList.remove('playing');
    playing = null;
  };
  player.addEventListener('ended', stop);
  player.addEventListener('error', () => {
    stop();
    toast('音檔載入失敗，請檢查網路');
  });

  $('#phrases-content').addEventListener('click', e => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('.phrase');
    if (!row) return;
    stop();
    player.src = `${import.meta.env.BASE_URL}audio/phrases/${row.dataset.phraseId}.mp3`;
    playing = row;
    row.classList.add('playing');
    player.play().catch(() => stop());
  });
}

function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.toggle('active', t === tab));
      panels.forEach(p => p.classList.toggle('active', p.id === tab.getAttribute('data-tab')));
    });
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  if (sharedPlaceId) {
    const shared = places.find(p => p.id === sharedPlaceId)!;
    if (isSpot(shared)) mode = modeOf(shared);
  }
  initSheet();
  initFilters();
  initSort();
  initConverter();
  initHotelCard();
  initInfoPanel();
  initTabs();
  initViewControls();
  initMap();
  setInterval(refreshOpenBadges, 60_000);
});
