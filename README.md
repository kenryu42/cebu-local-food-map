# 宿務在地美食 3D 地圖

Interactive 3D map of authentic local eateries in Cebu, Philippines, for a 42-person Japanese company trip (Oct 28 - Nov 1, 2026) staying at J Park Island Resort & Waterpark, Mactan.

**Live Site:** https://kenryu42.github.io/cebu-local-food-map/

## Features

- **Interactive 3D Map** with MapLibre GL JS
  - Tilted 3D view with terrain and building extrusions
  - Free tile source (OpenStreetMap) - no API keys required
  - Touch-optimized for mobile devices

- **16 Verified Locations**
  - Mactan Island: 6 restaurants + J Park Resort
  - Cebu City: 6 restaurants
  - Plus MCIA Airport marker

- **Smart Filters**
  - Area: Mactan / Cebu City
  - Category: Lechon, BBQ, Puso, Ngohiong/Siomai, Market

- **Detailed Information**
  - Recommended dishes (Traditional Chinese)
  - Distance from J Park
  - Operating hours
  - Direct Google Maps navigation links
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
- Maribago area (J Park vicinity): 10.2848, 123.9974

### Approximate Coordinates (Area-Based)
These restaurants are not in the OSM database. Coordinates use nearby landmarks or area centers:
- AA BBQ Soong: 10.310, 123.962 (Soong area reference)
- Nonie's Barbecue: 10.315, 123.970 (Agus area reference)
- Langging Fried Chicken: 10.312, 123.968 (Central Lapu-Lapu)
- CnT Lechon: 10.315, 123.905 (North Cebu City)
- Carlos Special Ngohiong: 10.305, 123.895 (Central Cebu City)
- Way Tugpahay Siomai: 10.295, 123.895 (Tisa/Katipunan area)

**Note:** Approximate coordinates are flagged with ⚠️ in popups. Use the Google Maps link for turn-by-turn navigation.

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
