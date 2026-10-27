# First visit and intro

On every load the map flies from Japan down to Cebu on a globe while the title 宿務 美食 景點 animates in and a photo of Goro stretched out like Superman flies across below it (「goro 也要去宿務！」); tapping skips it. It lands on an overview that frames every spot. Reduced motion, Data Saver, 2G, `?skip-intro` and shared spot links skip it; nothing is stored about it.

## Sub-features

- `intro-play` the globe flight, title card and Goro play on load.
- `intro-skip-tap` tapping the title card jumps to the overview.
- `intro-every-load` a reload plays it again.
- `intro-shared-link` a spot link skips the flight and opens the spot.
- `overview` the landing view frames all spots plus J Park, with the sheet collapsed.

## How to get to it (user POV)

- Open or reload the site URL.
- Tap anywhere on the title card while it plays.
- Open a shared spot link (`#place=<id>`).

## Driving it with drive.mjs

Preconditions:

- Doctor is all `OK`.

- **Play.** Open as a fresh visitor. Steps: `open '/cebu-local-food-map/?v=1' wait '#intro.playing' 10000 screenshot first-visit/01-intro.png waitfor "document.querySelector('#intro').classList.contains('done')" 20000 settle`. The title card appears, then fades; `body.ready` is set.
- **Overview.** Steps: `expect "document.querySelectorAll('.marker:not(.is-hidden)').length === 18" expect "document.querySelector('#panel').dataset.sheet === 'peek'" screenshot first-visit/02-overview.png`. 18 pins (16 food spots, hotel, airport) are visible above the sheet, none cut off at the screen edge in the screenshot.
- **Every load.** Steps: `open '/cebu-local-food-map/?v=2' wait '#intro.playing' 10000`. A reload plays it again.
- **Tap to skip.** Steps: `open '/cebu-local-food-map/?v=3' wait '#intro.playing' 10000 click '#intro' waitfor "document.body.classList.contains('ready')" 3000`. The overview appears within a moment.
- **Shared link.** Steps: `open '/cebu-local-food-map/?v=4#place=fort-san-pedro' wait '.maplibregl-popup .popup-content' 20000 expect "!document.querySelector('#intro').classList.contains('playing')"`. The spot opens directly.
- **Proof.** Keep `01-intro.png`, `02-overview.png`, the transcript and `first-visit/console.log` (expect no errors).

## Gotchas

- The flight takes about 8 s in headless software rendering; wait for `#intro.done`, not a fixed time.
- Change the query string (`?v=N`) between opens. A URL differing only in its `#hash` does not reload the page.
- Selecting a spot rewrites the address bar without its query string, so a later reload has no `?skip-intro`.
- Chrome's `navigator.connection.effectiveType` reflects the host machine's network; on a `2g` reading the flight is skipped by design. Check `eval "navigator.connection?.effectiveType"` when `intro-play` fails.
