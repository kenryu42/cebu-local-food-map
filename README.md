# 宿務美食景點

Interactive 3D map of authentic local eateries and sightseeing spots in Cebu, Philippines, for a 42-person Japanese company trip (Oct 28 - Nov 1, 2026) staying at J Park Island Resort & Waterpark, Mactan.

**Live Site:** https://kenryu42.github.io/cebu-local-food-map/

## Features

- **Interactive 3D Map** with MapLibre GL JS
  - Tilted 3D view with terrain and building extrusions
  - Free vector tiles (OpenFreeMap) - no API keys required
  - Touch-optimized for mobile devices
  - One-time Japan → Cebu globe intro, and 🎲 random picker

- **Food & Sightseeing Modes (🍴 美食 / 📸 景點)**
  - 16 eateries and markets, including all six of Cebu's 2026 Michelin Bib Gourmand picks, 9 sightseeing spots, plus J Park and MCIA markers
  - Food categories: 米其林必比登, Lechon, BBQ, Ngohiong/Siomai, 在地家常菜, Puso, Market
  - Sight categories: History, Churches & Temples, Viewpoints

- **Smart Filters**
  - Area: Mactan / Cebu City
  - Category chips with counts
  - Sort by area or by distance from you (📍 離我最近)

- **Detailed Information**
  - Recommended dishes (Traditional Chinese)
  - Distance from J Park
  - Operating hours, with a 營業中 / 即將打烊 / 休息中 badge (Cebu time) where hours are reliable
  - Prices and entry fees in pesos with the yen equivalent
  - Direct Google Maps navigation links
  - 🔗 Share a spot: links (`#place=<id>`) open straight to that spot
  - 🏨 Hotel card to show drivers, plus 911 and emergency lines for the Chinese Consulate General in Cebu, the Taipei Economic and Cultural Office (Manila), and the Consulate General of Japan in Cebu
  - ₱ ⇄ ¥ converter (live rate, cached for offline use)
  - 26 Cebuano phrases by situation; tap one to hear it (pre-generated ElevenLabs audio in `public/audio/phrases/`)
  - Local dish glossary
  - Street food safety tips
  - Undas holiday traffic warning

- **Mobile-First Design**
  - Optimized for iPhone Safari
  - Works offline after initial load
  - Fast and lightweight

## Development

### Prerequisites

- Node.js 18+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs on http://localhost:5174

### Tech Stack

- **Framework:** Vite + TypeScript
- **Mapping:** MapLibre GL JS
- **Tiles:** OpenStreetMap (free, no API key)
- **Styling:** Custom CSS (mobile-first)
- **Deployment:** GitHub Pages via GitHub Actions

## Deployment

This site is configured for GitHub Pages deployment at:
https://kenryu42.github.io/cebu-local-food-map/

### Automatic Deployment

Push to `main` branch triggers the GitHub Actions workflow:
1. Installs dependencies
2. Builds the site
3. Deploys to GitHub Pages

### Manual Deployment Steps

If deploying manually or to a different host:

```bash
# Build for production
npm run build

# The dist/ folder contains the static site
# Upload dist/ to your static host
```

## Coordinate Sources

Each place in `src/data.ts` records where its coordinates came from in `coordinateNote`. Most are
exact OpenStreetMap matches. Three restaurants are not in OSM and are placed on their street, so
their popups show ⚠️ 座標為區域參考位置: Trillis (Pusok), Esmen Carinderia and Pares Batchoy Food
House. The Google Maps button navigates by name, so it still finds the right door.

## How spots are chosen

The bar is good food at a fair price, not tourist traps. Spots were fact-checked in October 2026
against recent local media (SunStar Cebu, Sugbo.ph, Suroy.ph, Keeta.ph) and the 2026 Michelin Guide
Bib Gourmand list. Larsian (now Sugbo Sentro, reported run-down in 2025) and Puso Village (a new
developer-built food hall) were dropped, as were Nonie's Barbecue and Langging Fried Chicken, which
had nothing behind them but a directory listing.

## Phrase audio

The phrase clips are generated once and committed, so the site needs no API key at runtime.
After adding or changing a phrase in `src/data.ts`:

```bash
ELEVENLABS_API_KEY=... node scripts/generate-phrase-audio.ts
```

It only generates new or changed phrases, checks each clip decodes, prints what speech-to-text heard
(short clips are often heard in another language, so listen to any it flags), and deletes the
generations from ElevenLabs afterwards. Needs `ffprobe`.

## Tests

```bash
npm test
```

Runs the trip logic tests (opening status in Cebu time, peso/yen prices, share links, distance sorting) with Node's built-in test runner.

## Data Sources

- Mactannow.com (local Mactan guide)
- Keeta.ph (Cebu food culture)
- Sugbo.ph (Cebu destinations)
- CebuDestinations.com
- ChillAndTravel.com (lechon reviews)
- Official restaurant sites

## License

MIT License - Free to use and modify.

## Credits

Built with poteto-mode principles: real data, no fabrication, mobile-first, proven with screenshots.
