# Select a spot

Selecting a spot flies the camera in at an angle over 3D buildings, draws a dotted arc from J Park, drops the phone sheet to its peek height and opens a popup with categories, an open-now badge where hours are reliable, hours, price in pesos and yen, distance from J Park, a Google Maps 導航 link and 🔗 分享, and a footer with ‹ 上一家 / 下一家 › (上一個 / 下一個 for sights) and the spot's position in the list. The address bar carries `#place=<id>` while it is open, and a link with that hash opens the same spot.

## Sub-features

- `select-list` choose a spot from the list.
- `select-pin` tap a pin on the map.
- `select-link` open a shared link on a fresh load, or while the app is already open.
- `popup-content` popup shows the spot's details, badge and yen price.
- `popup-nav` 導航 opens Google Maps for that spot.
- `popup-step` ‹ › step through the list as shown (filters and sort applied), wrapping at the ends, without reopening the sheet.
- `sheet-reopen` tapping any non-control part of the collapsed sheet opens the full list, with the viewed spot highlighted.
- `share-copy` 分享 copies the spot link (browsers without Web Share).
- `select-close` closing the popup clears the selection and the hash.

## How to get to it (user POV)

- Tap a card in the 清單 tab.
- Tap a pin on the map.
- Open a link ending in `#place=<id>`, or follow one while the map is open.
- In the popup, tap 🧭 Google Maps 導航, 🔗 分享, ‹ / ›, or ×.
- Tap the collapsed sheet's title or blank area to get back to the list.

## Driving it with drive.mjs

Preconditions:

- Page is usable (`open '/cebu-local-food-map/?skip-intro' waitfor "document.body.classList.contains('ready')" 30000 settle`).

- **List.** Open the sheet and choose AA BBQ. Steps: `click '#sheet-handle' waitfor "document.querySelector('#panel').dataset.sheet === 'full'" 3000 click '.list-item[data-id="aa-bbq"]' wait '.maplibregl-popup .popup-content' 15000`. The popup opens after the flight; `expect "location.hash === '#place=aa-bbq'"`, `expect "document.querySelector('#panel').dataset.sheet === 'peek'"`, `expect "document.querySelector('.marker.is-active') !== null"`.
- **Popup content.** Steps: `text '.maplibregl-popup .popup-content'`. Shows `AA BBQ Soong`, `⏰ 11:00–23:00`, `📍 距離 J Park`, both buttons; the badge reads 營業中 / 即將打烊 / 休息中 according to the current time in Cebu (UTC+8). For a priced spot select `temple-of-leah` and expect `💰 門票 ₱50–100（約 ¥…）`.
- **Pin.** Switch to sights and tap a pin by name. Steps: `click '.mode[data-mode="sight"]' settle click-text '.marker:not(.is-hidden)' 'Temple of Leah' wait '.maplibregl-popup .popup-content' 15000 expect "location.hash === '#place=temple-of-leah'"`.
- **Navigate.** Steps: `eval "document.querySelector('.maplibregl-popup .maps-link').href"`. A `https://www.google.com/maps/search/?api=1&query=...` URL for the spot, opening in a new tab.
- **Share (copy).** Steps: `eval "delete Navigator.prototype.share" click '.maplibregl-popup .share-btn' wait '#toast.show' 5000 text '#toast' eval "navigator.clipboard.readText()"`. Toast `已複製連結，貼到群組吧 ✅`; clipboard holds `http://127.0.0.1:<PORT>/cebu-local-food-map/#place=<id>`. Report that Web Share was removed to reach this path.
- **Link, fresh load.** Steps: `open '/cebu-local-food-map/?l=1#place=pungko-fuente' wait '.maplibregl-popup .popup-content' 20000 expect "document.querySelector('.mode.active').dataset.mode === 'food'"`. Opening a sight id (`temple-of-leah`) switches the mode to 景點.
- **Link, app open.** Steps: `eval "location.hash = 'place=fort-san-pedro'" wait '.maplibregl-popup .popup-content' 15000 expect "document.querySelector('.popup-content h3').textContent.includes('Fort San Pedro')"`.
- **Step through.** From AA BBQ: `text '.maplibregl-popup .nav-count'` is `1 / 18` (16 food spots, then J Park and the airport under 地標). Steps: `click '.maplibregl-popup .nav-btn:last-child' waitfor "document.querySelector('.maplibregl-popup .nav-count')?.textContent.startsWith('2 /')" 15000 expect "location.hash === '#place=ayers-lechon'"`; `‹` from 1 wraps to the last entry. With `--geo` and 📍 離我最近 the order follows distance.
- **Back to the list.** Steps: `click '.panel-title' settle expect "document.querySelector('#panel').dataset.sheet === 'full'" expect "document.querySelector('.list-item.is-active')"`. Buttons on the collapsed sheet (🎲, the converter, 🏨, 美食/景點) keep their own action.
- **Close.** Steps: `click '.maplibregl-popup-close-button' gone '.maplibregl-popup' 3000 expect "location.hash === ''" expect "document.querySelector('.marker.is-active') === null"`.
- **Proof.** `screenshot select-place/<step>.png` after each popup opens (`sleep 1200` first, the camera keeps orbiting), plus `--console select-place/console.log`.

## Gotchas

- With the sheet at `peek`, the list is off screen; `click` says so. Open the sheet first.
- The ‹ › targets are fixed when the card opens; after `click '.nav-btn'` wait for the new `.nav-count`, the old card is removed during the flight.
- Don't click the popup while the camera is still flying; `wait` for `.popup-content` first (the driver also waits for the target to stop moving).
- In headless Chrome `navigator.share` exists but never settles, so 分享 hangs on that path. Only the copy path is provable here; the native share sheet needs a real phone.
- 導航 opens Google Maps in a new tab of this run's browser. `drive.mjs` stays on the app tab and prints a note about other tabs.
- Pins in central Cebu City overlap; `click-text` reports `covered by` when another pin is on top. Pick an isolated pin or zoom first.
- The orbit keeps rotating the map, so screenshots of the same state differ slightly.
