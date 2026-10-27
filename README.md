# 宿務美食景點

Interactive 3D map of authentic local eateries and sightseeing spots in Cebu, Philippines, for a 42-person Japanese company trip (Oct 28 - Nov 1, 2026) staying at J Park Island Resort & Waterpark, Mactan.

**Live Site:** https://kenryu42.github.io/cebu-local-food-map/

## Features

- **Interactive 3D Map** with MapLibre GL JS
  - Tilted 3D view with terrain and building extrusions
  - Free vector tiles (OpenFreeMap) - no API keys required
  - Touch-optimized for mobile devices
  - One-time Japan → Cebu globe intro, 🎲 random picker, and auto tour

- **Food & Sightseeing Modes (🍴 美食 / 📸 景點)**
  - 14 eateries and markets, 9 sightseeing spots, plus J Park and MCIA markers
  - Food categories: Lechon, BBQ, Puso, Ngohiong/Siomai, Market
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

All locations geocoded using OpenStreetMap Nominatim API (Oct 27, 2026):

### Verified Coordinates (Exact OSM Match)
- MCIA Airport: 10.3103, 123.9793
- Carbon Market: 10.2920, 123.8978
- Lapu-Lapu City Public Market: 10.3111, 123.9505
- Fuente Osmena area: 10.3093, 123.8935
- Mactan Newtown: 10.3085, 124.0130
- Pusok area: 10.3245, 123.9743
- Puso Village: 10.2913, 123.9016
- JPark Island Resort & Waterpark: 10.28276, 123.99551 (OSM node "JPark resort")

### Sightseeing (Exact OSM Match)
- Magellan's Cross: 10.2935702, 123.9019584
- Basilica del Santo Niño: 10.2943421, 123.9021033
- Fort San Pedro: 10.2927283, 123.9058911
- Yap-San Diego Ancestral House: 10.2992579, 123.9039722
- Heritage of Cebu Monument: 10.2988934, 123.9036170
- Mactan Shrine (Liberty Shrine): 10.3109738, 124.0151380
- Temple of Leah: 10.3688795, 123.8733158
- Cebu Taoist Temple: 10.3343184, 123.8879852
- Sirao Flower Garden: 10.4070429, 123.8665474

Sightseeing hours and entry fees differ between sources, so they are shown as approximate and marked 需確認.

### Approximate Coordinates (Area-Based)
These restaurants are not in the OSM database. Coordinates use nearby landmarks or area centers:
- AA BBQ Soong: 10.310, 123.962 (Soong area reference)
- Nonie's Barbecue: 10.315, 123.970 (Agus area reference)
- Langging Fried Chicken: 10.312, 123.968 (Central Lapu-Lapu)
- CnT Lechon: 10.315, 123.905 (North Cebu City)
- Carlos Special Ngohiong: 10.305, 123.895 (Central Cebu City)
- Way Tugpahay Siomai: 10.295, 123.895 (Tisa/Katipunan area)

**Note:** Approximate coordinates are flagged with ⚠️ in popups. Use the Google Maps link for turn-by-turn navigation.

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
