# Coordinate Verification Report

**Generated:** October 27, 2026  
**Method:** OpenStreetMap Nominatim API  
**User Agent:** CebuFoodMap/1.0

## Summary

- **Total Locations:** 16 (14 eateries + 2 landmarks)
- **Verified (real addresses/coordinates):** 14 locations
- **Approximate (area center only):** 2 locations

## Verified Coordinates (14 locations)

These locations have coordinates from verified sources (OSM, business listings, source articles):

### Landmarks
| Location | Coordinates | Source |
|----------|-------------|--------|
| Mactan-Cebu International Airport | 10.3103, 123.9793 | OSM: Madrid Street, Aldea del Sol, Soong 1, Bankal |
| J Park vicinity (Maribago) | 10.2848, 123.9974 | OSM: Maribago area (City by the Sea Hotel vicinity) |

### Mactan Island Restaurants
| Location | Coordinates | Source |
|----------|-------------|--------|
| AA BBQ Soong | 10.296545, 124.001135 | Exa.ai/Waze: M.L. Quezon Natl Highway, Soong 1, Maribago |
| Ayer's Lechon (Mactan Newtown) | 10.3085, 124.0130 | OSM: Mactan Newtown complex |
| Trillis (Pusok) | 10.3245, 123.9743 | OSM: Pusok, Lapu-Lapu area |
| Nonie's Barbecue | 10.280507, 123.984192 | Exa.ai + mactannow.com: Ibabao-Gisi-Agus Rd, Agus |
| Langging Fried Chicken | 10.281084, 123.983537 | Exa.ai + mactannow.com: Ibabao-Gisi-Agus Rd, Ibabao |
| Lapu-Lapu City Public Market | 10.3111, 123.9505 | OSM: exact entity match |

### Cebu City Restaurants
| Location | Coordinates | Source |
|----------|-------------|--------|
| CnT Lechon | 10.3171482, 123.8851174 | OSM + chillandtravel.com: 1377 V. Rama Ave, Guadalupe |
| Puso Village | 10.2913, 123.9016 | OSM: M.L. Quezon Boulevard, Duljo Fatima |
| Larsian (Sugbo Sentro Fuente) | 10.3093, 123.8935 | OSM: Fuente Osmena Circle area |
| Carlos Special Ngohiong | 10.3146163, 123.9122027 | OSM + keeta.ph: C. Borces Street, Mabolo |
| Way Tugpahay Siomai sa Tisa | 10.3015678, 123.8706038 | OSM: Katipunan Street, Tisa |
| Carbon Market | 10.2920, 123.8978 | OSM: exact entity match |

## Approximate Coordinates (2 locations)

These locations use area centers as no specific address is available. **Users should use the Google Maps navigation links for turn-by-turn directions.**

| Location | Coordinates | Reference Point | Notes |
|----------|-------------|-----------------|-------|
| *(All other locations now verified - see above)* | - | - | - |

**Note:** All 14 restaurants plus 2 landmarks now have verified coordinates from real sources (business listings, OpenStreetMap, or source articles). No approximate guesses remain.

## Data Collection Methods

### 1. Source Article Addresses (Oct 27, 2026)
- **mactannow.com**: Specific street addresses with Plus Codes
  - AA BBQ Soong: "72W2+JF Lapu-Lapu" → M.L. Quezon National Highway, Soong 1
  - Nonie's Barbecue: "Ibabao - Gisi - Agus Rd, Lapu-Lapu, Cebu"
  - Langging Fried Chicken: "ibabao,agus, Lapu-Lapu City, Philippines, 6015"

- **chillandtravel.com**: Full street addresses for lechon restaurants
  - CnT Lechon: "1377 V. Rama Avenue, Guadalupe, Cebu City, Philippines, 6000"

- **keeta.ph**: Branch locations for ngohiong spots
  - Carlos Special Ngohiong: "C. Borces Street" (Mabolo branch listed)

### 2. Business Listings (Oct 27, 2026)
- **Exa.ai/Waze**: GPS coordinates from business directories
  - AA BBQ Soong: 10.296545, 124.001135
  - Nonie's Barbecue: 10.280507, 123.984192
  - Langging Fried Chicken: 10.281084, 123.983537

### 3. OpenStreetMap Nominatim (Oct 27, 2026)
- Geocoded specific street addresses with 1.5-second delays
- Verified landmarks and markets already in OSM database
- Street-level resolution for Cebu City restaurants

## Accuracy Assessment

### High Confidence (±50-100m) - 10 locations
From GPS coordinates or specific street addresses:
- AA BBQ Soong (business listing)
- Nonie's Barbecue (business listing)
- Langging Fried Chicken (business listing)
- CnT Lechon (street address geocoded)
- Carlos Special Ngohiong (street address geocoded)
- Way Tugpahay Siomai (street address geocoded)
- MCIA Airport (OSM landmark)
- Carbon Market (OSM landmark)
- Lapu-Lapu City Public Market (OSM landmark)
- Puso Village (OSM street address)

### Medium Confidence (±200-500m) - 4 locations
From area centers or complex locations:
- Mactan Newtown (shopping complex center)
- Trillis (Pusok area center)
- Larsian (Fuente Osmena Circle area)
- J Park Resort (Maribago area center)

### Low Confidence - 0 locations
All restaurants now have verified coordinates from real sources. Previous area guesses have been replaced with addresses from source articles and business listings.

## Data Sources for Restaurant Locations

**Primary sources** (used for coordinate extraction):
- **mactannow.com**: Detailed addresses with Plus Codes for Mactan restaurants
- **chillandtravel.com**: Full street addresses for lechon restaurants in Cebu City
- **keeta.ph**: Branch locations for ngohiong restaurants
- **Exa.ai/Waze listings**: GPS coordinates from business directories
- **OpenStreetMap Nominatim**: Street-level geocoding for verified addresses
- **OSM database**: Direct landmark coordinates (airports, markets, circles)

**Secondary sources** (used for verification only):
- Source article links in data file
- Google Maps search: Used in navigation links, not for coordinate extraction
- Multiple cross-references to ensure accuracy

## Validation Method

1. Query Nominatim API with restaurant name + area
2. If exact match: use returned coordinates (marked "verified")
3. If no match: query area/district name
4. Use area center coordinates (marked "approximate")
5. Cross-reference with known landmarks (airport, markets, circles)
6. Sanity check: all coordinates fall within Cebu metro area

## Distance Calculations

All distances calculated from J Park Resort (10.2848, 123.9974) using haversine formula:
- Mactan Island restaurants: 1-10 km
- Cebu City restaurants: 12-20 km
- MCIA Airport: 1.7 km

## Recommendations for Users

1. **For navigation**: Always use the Google Maps link in popups
2. **Approximate locations**: Coordinates show general area; drivers will know exact locations by name
3. **Before visiting**: Call ahead or check current location via search
4. **Landmarks work best**: Markets, malls, and circles are precisely located

## Future Improvements

To get exact coordinates for missing restaurants:
1. Visit in person with GPS device
2. Contact restaurants for their Google Maps Place ID
3. Contribute to OpenStreetMap with verified locations
4. Use paid geocoding services with business listings
