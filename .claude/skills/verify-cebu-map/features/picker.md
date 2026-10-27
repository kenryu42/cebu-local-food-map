# Picker

🎲 今晚吃什麼？ (food) / 去哪裡玩？ (sights) spins a slot machine through the currently filtered spots, lands on one with an emoji burst, then flies to it and opens its popup.

## Sub-features

- `picker-spin` the overlay cycles names and lands on a spot from the current filter.
- `picker-select` after landing, the chosen spot is selected with its popup.

## How to get to it (user POV)

- Tap 🎲 今晚吃什麼？ / 去哪裡玩？ in the sheet.

## Driving it with drive.mjs

Preconditions:

- Page is usable (`open '/cebu-local-food-map/?skip-intro' waitfor "document.body.classList.contains('ready')" 30000 settle`).

- **Spin.** Steps: `click '#roulette-btn' wait '#roulette:not([hidden])' 3000 screenshot picker/01-spinning.png wait '#roulette.won' 10000 text '#roulette-name'`. The name is one of the visible food spots.
- **Land.** Steps: `gone '#roulette' 8000 wait '.maplibregl-popup .popup-content' 15000 eval "location.hash"`. The hash is `#place=<the landed id>` and the popup title matches the name from Spin.
- **Filtered pool.** Steps: `click '.chip[data-category="lechon"]' click '#roulette-btn' wait '#roulette.won' 10000 text '#roulette-name'`. Repeat a few times; every result is a lechon spot.
- **Proof.** Spinning and landed screenshots, the transcript with landed names, `--console picker/console.log`.

## Gotchas

- The landed spot is random. Assert membership in the filtered set and consistency between name, hash and popup, not a specific id.
- The emoji burst and orbit have no end state; screenshot after `wait`/`gone`, and use `sleep` only right before a screenshot.
- With reduced motion the spin lands immediately and the burst is skipped.
