# Modes, filters and sorting

The 🍴 美食 / 📸 景點 switch picks which spots the map, list, chips, picker and tour use; the hotel and airport show in both. The area toggle (全部 / 麥克坦島 / 宿務市區) and category chips narrow the spots and reframe the map, chips show counts, and the list can be sorted by area or by distance from the visitor (📍 離我最近).

## Sub-features

- `mode-food` food spots with Lechon / BBQ / Puso / Ngohiong / 市場 chips.
- `mode-sight` sights with 歷史古蹟 / 教堂寺廟 / 山景拍照 chips; picker and tour labels change.
- `area-filter` 麥克坦島 / 宿務市區 hide the other area's spots and refit the map.
- `category-chips` toggling chips narrows the list and pins; counts reflect the area.
- `sort-near` 離我最近 lists spots nearest first with 🚶 離你 distances.
- `sort-denied` without location, 離我最近 shows a toast and keeps the area order.

## How to get to it (user POV)

- Tap 美食 or 景點 at the top of the sheet.
- Tap an area segment, or a category chip (swipe the chip row sideways on phones).
- In 清單, tap 依地區 or 📍 離我最近 and allow location.

## Driving it with drive.mjs

Preconditions:

- Page is usable (`open '/cebu-local-food-map/?skip-intro' waitfor "document.body.classList.contains('ready')" 30000 settle`).

- **Sight mode.** Steps: `click '.mode[data-mode="sight"]' settle`. `expect "[...document.querySelectorAll('.chip')].map(c => c.dataset.category).join() === 'history,temple,viewpoint'"`, `expect "document.querySelector('#roulette-btn').textContent.includes('去哪裡玩')"`, `expect "document.querySelectorAll('.marker:not(.is-hidden)').length === 11"` (9 sights + hotel + airport).
- **Food mode.** Steps: `click '.mode[data-mode="food"]' settle`. Five food chips; 14 pins; picker reads 今晚吃什麼.
- **Switch with a spot open.** Select a spot, then switch mode. Steps: `click '#sheet-handle' waitfor "document.querySelector('#panel').dataset.sheet === 'full'" 3000 click '.list-item[data-id="aa-bbq"]' wait '.maplibregl-popup .popup-content' 15000 click '.mode[data-mode="sight"]' sleep 2500 expect "[...document.querySelectorAll('.marker:not(.is-hidden)')].every(m => { const r = m.getBoundingClientRect(); return r.top >= 0 && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; })"`. The map leaves the old spot and frames every sight, and the console has no `Map cannot fit within canvas` warning. Repeat with `click '#reset-view'` and an area segment in place of the mode switch.
- **Area.** Steps: `click '.seg[data-area="mactan"]' settle`. `expect "[...document.querySelectorAll('.list-item')].every(i => !['cnt-lechon','larsian','carbon-market'].includes(i.dataset.id))"`; the map reframes on Mactan (screenshot).
- **Chip.** Steps: `click '.seg[data-area="all"]' click '.chip[data-category="lechon"]'`. `expect "document.querySelector('.chip[data-category=\"lechon\"]').classList.contains('active')"` and the list holds only lechon spots (`ayers-lechon`, `cnt-lechon`, `puso-village`) plus landmarks. Tap again to clear.
- **Nearest.** Run with `--geo 10.2944,123.9021` (Santo Niño). Steps: `click '.mode[data-mode="sight"]' click '#sheet-handle' waitfor "document.querySelector('#panel').dataset.sheet === 'full'" 3000 click '.sort[data-sort="near"]' waitfor "document.querySelector('.list-section h4')?.textContent === '離你最近'" 10000`. First items are `santo-nino`, `magellans-cross`, `fort-san-pedro`, each with `🚶 離你 … km`.
- **Denied.** Without `--geo`: `click '.sort[data-sort="near"]' wait '#toast.show' 10000 text '#toast'`. Toast `拿不到你的位置，請允許定位後再試一次`; `.sort[data-sort="area"]` stays active.
- **Proof.** Screenshot after each switch (`modes-filters/<step>.png`) and record the `expect` lines in the transcript.

## Gotchas

- `--geo` is a stand-in for GPS; say so. Without it the page sees location as denied and MapLibre logs `Geolocation support is not available so the GeolocateControl will be disabled.` That warning is expected, not a regression.
- Switching mode clears selected chips and any open popup.
- A reframe after a selection once failed silently on phones (the selection's padding stacked on the overview's). `Map cannot fit within canvas` in the console means that regression is back.
- On phones a mode switch reopens a collapsed sheet to `half`.
- The chip row scrolls sideways at 390 px; `click` scrolls a chip into view only if it is off screen.
