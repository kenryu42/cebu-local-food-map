# Trip tools

The 資訊 tab has a ₱ ⇄ ¥ converter (today's rate, cached on the phone, with its date shown), 26 Cebuano phrases in five situations that play their pronunciation when tapped, a glossary, street-food tips, the Undas warning and source links. The 🏨 button opens a card to show a driver (JPark Island Resort & Waterpark, address, 導航回飯店, 打給飯店) with 911 and emergency lines for the Chinese Consulate General in Cebu, the Taipei Economic and Cultural Office (Manila; there is no Cebu office) and the Consulate General of Japan in Cebu. The 2D/3D and ⤢ buttons switch the view and return to the overview.

## Sub-features

- `convert-php` typing pesos shows yen.
- `convert-jpy` typing yen shows pesos.
- `convert-quick` quick amounts fill both fields.
- `rate-cache` the rate line shows a date and the rate is stored for offline use.
- `hotel-card` the driver card opens and closes; its links dial or navigate.
- `phrases` the phrase list shows Cebuano with meanings, grouped by situation.
- `phrase-audio` tapping a phrase plays its clip; another tap switches clips, one at a time.
- `view-tools` 2D flattens the map; ⤢ returns to the overview.

## How to get to it (user POV)

- Open the 資訊 tab in the sheet (expand the sheet on phones); tap a phrase to hear it.
- Tap the 🏨 button at the top left of the map; close with ×, the backdrop, or Escape.
- Tap 2D / 3D or ⤢ at the top left.

## Driving it with drive.mjs

Preconditions:

- Page is usable (`open '/cebu-local-food-map/?skip-intro' waitfor "document.body.classList.contains('ready')" 30000 settle`).

- **Open 資訊.** Steps: `click '#sheet-handle' waitfor "document.querySelector('#panel').dataset.sheet === 'full'" 3000 click '.tab[data-tab="info-panel"]' wait '#php-input'`.
- **Pesos to yen.** Steps: `type '#php-input' '250'`. `eval "document.querySelector('#jpy-input').value"` equals `Math.round(250 × rate)`, where the rate is the number in `text '#rate-info'` (`₱1 ≈ ¥2.46（10/27 匯率…）`).
- **Yen to pesos.** Steps: `type '#jpy-input' '1000'`. The peso field shows `1000 ÷ rate`, whole pesos at 100 and above.
- **Quick amount.** Steps: `click '.quick-amounts button[data-php="500"]'`. `#php-input` is `500` and `#jpy-input` updates.
- **Rate stored.** Steps: `eval "localStorage.getItem('cebu-food-map:php-jpy')"`. JSON with `value` and `date` once the live rate has loaded.
- **Phrases.** Steps: `eval "[...document.querySelectorAll('.phrase-group')].map(h => h.textContent).join(' / ') + ' ' + document.querySelectorAll('.phrase').length"`. `打招呼 / 吃飯點餐 / 購物殺價 / 問路搭車 / 實用短句 26`.
- **Hear a phrase.** Steps: `click '.phrase[data-phrase-id="lami-kaayo"]' wait '.phrase[data-phrase-id="lami-kaayo"].playing' 3000 gone '.phrase.playing' 8000`. The row highlights while the clip plays and clears when it ends. Then `click '.phrase[data-phrase-id="maayong-buntag"]' wait '.phrase.playing' 3000 click '.phrase[data-phrase-id="salamat"]' expect "document.querySelectorAll('.phrase.playing').length === 1"`: only the latest clip plays. Prove the files arrived with `eval "performance.getEntriesByType('resource').filter(e => e.name.includes('/audio/phrases/')).map(e => e.name.split('/').pop() + ' ' + e.responseStatus)"` (200 or 206) and `expect "!document.querySelector('#toast').textContent.includes('音檔')"` (no load-error toast).
- **Hotel card.** Steps: `click '#hotel-btn' wait '#hotel-card:not([hidden])' 3000 screenshot trip-tools/hotel-card.png eval "[...document.querySelectorAll('#hotel-card a')].map(a => a.getAttribute('href'))" key Escape gone '#hotel-card' 3000`. Links: Google Maps directions to JPark, `tel:+63324945000`, `tel:911`, `tel:+63323430008` (China), `tel:+639178194597` (Taiwan), `tel:+63322317321` (Japan).
- **2D and overview.** Steps: `click '#view-toggle' waitfor "document.querySelector('#view-toggle').textContent === '3D'" 3000 screenshot trip-tools/2d.png click '#view-toggle' click '#reset-view' settle`. The map flattens with no 3D buildings, then returns tilted and framed on all spots.
- **Proof.** Screenshots of the converter, hotel card and 2D view; transcript with field values and hrefs.

## Gotchas

- The rate is live from open.er-api.com; compute expectations from the shown rate, never a hard-coded number. Offline it falls back to the cached or built-in rate and the date tells how old it is.
- `type` replaces the field's text; `input` events fire as for real typing.
- Calling the `tel:` links is not drivable; assert the hrefs.
- Headless Chrome plays audio silently. The harness proves a clip downloaded and played to its end, not that it sounds right; whether the Cebuano sounds natural needs a person listening.
- The hotel card covers the map; close it before the next step or `click` reports `covered by div#hotel-card`.
