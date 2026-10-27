# Cebu map verification map

This directory is the maintained source for verifying the user-facing behavior of the Cebu food & sightseeing map. Read this index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Launch with `RUN_ID=<id> $S/launch.sh` and require `READY`. `S=.claude/skills/verify-cebu-map/scripts`.
- Run `RUN_ID=<id> $S/doctor.sh` and require every line `OK` (including the remote tile and rate services).
- Default viewport is a 390×844 phone. Desktop checks use a separate run with `VIEWPORT=1280,900` and its own ports.
- Start each journey from a usable page: `open '/cebu-local-food-map/?skip-intro' waitfor "document.body.classList.contains('ready')" 30000 settle`, plus `clear-storage` first when the journey depends on a fresh visitor.
- Never drive an instance this run did not start.

## Driving conventions

- Every command below is `RUN_ID=<id> $S/drive.mjs [options] STEP...`; recipes list only the steps. Keep a journey in one invocation.
- Use the stable handles in `../SKILL.md` (ids and `data-*` attributes). Use `click-text` only where a handle has no id, such as map pins.
- On phones the list sits in the bottom sheet: in the `half` state most list items are below the screen. Open the sheet (`click '#sheet-handle'` → `full`) before clicking a list item, as a person would scroll or expand.
- Wait on state (`wait`, `waitfor`, `gone`, `settle`), not on `sleep`. `sleep` is only for a screenshot after an animation that has no end state (the orbit).
- Place ids come from `src/data.ts`; quoted names and flags are literal.

## Proof and skip reporting

- Capture the user action and the resulting state: an `expect` on the observable result next to a screenshot.
- Save artifacts under `$EVIDENCE_DIR/<feature>/` and pass `--console <feature>/console.log`; tee the transcript to `<feature>/drive.txt`.
- Side effects are part of the proof: URL hash, `localStorage`, clipboard.
- Name every stand-in you used (`--geo`, a removed `navigator.share`).
- Report an unreachable path with the attempted step and the unmet precondition. Do not report an entry point as verified through a different one.
- Native share sheet, real touch/iOS Safari and real GPS cannot be proven here; list them as unverified.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with drive.mjs` starts with `Preconditions:` and uses labeled bullets that pair each user action with exact steps and the observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, steps, and observable proof.

## Features

- [First visit and intro](./first-visit.md) covers the one-time Japan → Cebu flight, skipping it, and the overview it lands on.
- [Select a spot](./select-place.md) covers opening a spot from the list, a map pin, or a shared link, the popup contents, sharing, and closing.
- [Modes, filters and sorting](./modes-filters.md) covers 美食 / 景點, area and category filters, and 離我最近.
- [Picker and tour](./picker-tour.md) covers 🎲 今晚吃什麼 / 去哪裡玩 and ▶ 巡禮.
- [Trip tools](./trip-tools.md) covers the ₱ ⇄ ¥ converter, the 🏨 hotel and emergency card, phrases, and the 2D / overview tools.
