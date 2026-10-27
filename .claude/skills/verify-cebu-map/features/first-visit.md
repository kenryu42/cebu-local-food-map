# First visit and intro

On a phone's first visit the map flies from Japan down to Cebu on a globe while the title 宿務 美食 景點 animates in; tapping skips it. It plays once per phone, then later visits land straight on an overview that frames every spot. Reduced motion, Data Saver, 2G, `?skip-intro` and shared spot links skip it, and only a flight that actually played marks it as seen.

## Sub-features

- `intro-play` the globe flight and title card play on a first visit.
- `intro-skip-tap` tapping the title card jumps to the overview.
- `intro-once` a second visit does not replay it.
- `intro-shared-link` a first visit through a spot link skips the flight without spending it.
- `overview` the landing view frames all spots plus J Park, with the sheet half open.

## How to get to it (user POV)

- Open the site URL with no stored data.
- Tap anywhere on the title card while it plays.
- Open the site again later.
- Open a shared spot link (`#place=<id>`) as the first visit.

## Driving it with drive.mjs

Preconditions:

- Doctor is all `OK`. The journey starts with `clear-storage`.

- **Play.** Open as a fresh visitor. Steps: `clear-storage open '/cebu-local-food-map/?v=1' wait '#intro.playing' 10000 screenshot first-visit/01-intro.png waitfor "document.querySelector('#intro').classList.contains('done')" 20000 settle`. The title card appears, then fades; `body.ready` is set.
- **Seen.** Steps: `expect "localStorage.getItem('cebu-food-map:intro-seen') === '1'"`. The flag is stored only after the flight.
- **Overview.** Steps: `expect "document.querySelectorAll('.marker:not(.is-hidden)').length === 14" expect "document.querySelector('#panel').dataset.sheet === 'half'" screenshot first-visit/02-overview.png`. 14 pins (12 food spots, hotel, airport) are visible above the sheet, none cut off at the screen edge in the screenshot.
- **Once.** Steps: `open '/cebu-local-food-map/?v=2' waitfor "document.body.classList.contains('ready')" 30000 expect "!document.querySelector('#intro').classList.contains('playing')"`. No flight on the second visit.
- **Tap to skip.** Steps: `clear-storage open '/cebu-local-food-map/?v=3' wait '#intro.playing' 10000 click '#intro' waitfor "document.body.classList.contains('ready')" 3000 expect "localStorage.getItem('cebu-food-map:intro-seen') === '1'"`. The overview appears within a moment and the intro counts as seen.
- **Shared link first.** Steps: `clear-storage open '/cebu-local-food-map/?v=4#place=fort-san-pedro' wait '.maplibregl-popup .popup-content' 20000 expect "!document.querySelector('#intro').classList.contains('playing')" expect "localStorage.getItem('cebu-food-map:intro-seen') === null"`. The spot opens directly and the intro is still unspent.
- **Proof.** Keep `01-intro.png`, `02-overview.png`, the transcript and `first-visit/console.log` (expect no errors).

## Gotchas

- The flight takes about 8 s in headless software rendering; wait for `#intro.done`, not a fixed time.
- Change the query string (`?v=N`) between opens. A URL differing only in its `#hash` does not reload the page.
- Selecting a spot rewrites the address bar without its query string, so a later reload has no `?skip-intro`.
- Chrome's `navigator.connection.effectiveType` reflects the host machine's network; on a `2g` reading the flight is skipped by design. Check `eval "navigator.connection?.effectiveType"` when `intro-play` fails.
