# Picker and tour

🎲 今晚吃什麼？ (food) / 去哪裡玩？ (sights) spins a slot machine through the currently filtered spots, lands on one with an emoji burst, then flies to it and opens its popup. ▶ 美食巡禮 / 景點巡禮 flies through every filtered spot in turn with a progress bar, and stops on ■ 停止巡禮 or when the map is touched.

## Sub-features

- `picker-spin` the overlay cycles names and lands on a spot from the current filter.
- `picker-select` after landing, the chosen spot is selected with its popup.
- `tour-run` the tour advances 1/N, 2/N… through filtered spots.
- `tour-stop` the stop button or touching the map ends the tour.

## How to get to it (user POV)

- Tap 🎲 今晚吃什麼？ / 去哪裡玩？ in the sheet.
- Tap ▶ 美食巡禮 / 景點巡禮; tap ■ 停止巡禮 or drag the map to stop.

## Driving it with drive.mjs

Preconditions:

- Page is usable (`open '/cebu-local-food-map/?skip-intro' waitfor "document.body.classList.contains('ready')" 30000 settle`).

- **Spin.** Steps: `click '#roulette-btn' wait '#roulette:not([hidden])' 3000 screenshot picker-tour/01-spinning.png wait '#roulette.won' 10000 text '#roulette-name'`. The name is one of the visible food spots.
- **Land.** Steps: `gone '#roulette' 8000 wait '.maplibregl-popup .popup-content' 15000 eval "location.hash"`. The hash is `#place=<the landed id>` and the popup title matches the name from Spin.
- **Filtered pool.** Steps: `click '.chip[data-category="lechon"]' click '#roulette-btn' wait '#roulette.won' 10000 text '#roulette-name'`. Repeat a few times; every result is a lechon spot.
- **Tour.** Steps: `click '#tour-btn' wait '#tour-bar:not([hidden])' 3000 text '#tour-progress' waitfor "document.querySelector('#tour-progress').textContent.includes(' 2/')" 15000`. Progress reads `美食巡禮 1/12 · …` then `2/12`.
- **Stop.** Steps: `click '#tour-stop' gone '#tour-bar' 3000`. The bar disappears and the camera stops moving.
- **Proof.** Spinning and landed screenshots, the transcript with landed names and progress text, `--console picker-tour/console.log`.

## Gotchas

- The landed spot is random. Assert membership in the filtered set and consistency between name, hash and popup, not a specific id.
- The emoji burst and orbit have no end state; screenshot after `wait`/`gone`, and use `sleep` only right before a screenshot.
- The full tour takes about 7 s per stop; don't wait for the end, prove 1 → 2 and stop.
- With reduced motion the spin lands immediately and the burst is skipped.
