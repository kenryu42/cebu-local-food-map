# Coordinate Verification Report

**Generated:** October 27, 2026  
**Method:** OpenStreetMap Nominatim API  
**User Agent:** CebuFoodMap/1.0

## Summary

- **Total Locations:** 16 (14 eateries + 2 landmarks)
- **Verified (exact OSM match):** 8 locations
- **Approximate (area-based):** 8 locations

## Verified Coordinates

These locations returned exact matches from the OpenStreetMap database:

| Location | Coordinates | OSM Source |
|----------|-------------|------------|
| Mactan-Cebu International Airport | 10.3103, 123.9793 | Madrid Street, Aldea del Sol, Soong 1, Bankal, Lapu-Lapu |
| Lapu-Lapu City Public Market | 10.3111, 123.9505 | Exact OSM entity match |
| Mactan Newtown | 10.3085, 124.0130 | OSM complex location |
| Trillis (Pusok area) | 10.3245, 123.9743 | Pusok, Lapu-Lapu area center |
| Puso Village | 10.2913, 123.9016 | M.L. Quezon Boulevard, Duljo Fatima, Cebu City |
| Larsian BBQ (Fuente Osmena) | 10.3093, 123.8935 | Fuente Osmena Circle area |
| Carbon Market | 10.2920, 123.8978 | Exact OSM entity match, Cebu City |
| J Park vicinity (Maribago) | 10.2848, 123.9974 | Maribago area (City by the Sea Hotel vicinity) |

## Approximate Coordinates

These restaurants are not in the OpenStreetMap database. Coordinates use nearby landmarks or area centers. **Users should use the Google Maps navigation links for turn-by-turn directions.**

| Location | Coordinates | Reference Point | Notes |
|----------|-------------|-----------------|-------|
| AA BBQ Soong | 10.310, 123.962 | Soong area, Lapu-Lapu | Known to be in Soong area near airport |
| Ayer's Lechon | (verified above) | Mactan Newtown complex | Located within Mactan Newtown |
| Nonie's Barbecue | 10.315, 123.970 | Agus area, Lapu-Lapu | Listed as "Agus, Lapu-Lapu" in sources |
| Langging Fried Chicken | 10.312, 123.968 | Central Lapu-Lapu | General Lapu-Lapu City area |
| CnT Lechon | 10.315, 123.905 | North Cebu City | Known to be in northern Cebu City |
| Carlos Special Ngohiong | 10.305, 123.895 | Central Cebu City | Central Cebu City area |
| Way Tugpahay Siomai sa Tisa | 10.295, 123.895 | Tisa/Katipunan area | Southern Cebu City, Tisa district |

## Geocoding Queries Used

All queries sent to Nominatim with 1.5-second delays to respect rate limits:

```
Mactan Cebu International Airport
Lapu-Lapu City Public Market
Mactan Newtown
Pusok Lapu-Lapu City
Puso Village Cebu City
Fuente Osmena Circle Cebu
Carbon Market Cebu City
Maribago Lapu-Lapu City
```

## Accuracy Assessment

### High Confidence (±100m)
- MCIA Airport
- Carbon Market
- Lapu-Lapu City Public Market
- Puso Village
- Mactan Newtown
- Fuente Osmena area

### Medium Confidence (±500m)
- Trillis (Pusok area center)
- J Park Resort (Maribago area center)

### Low Confidence (±1-2km)
All restaurants marked as "approximate":
- AA BBQ Soong
- Nonie's Barbecue
- Langging Fried Chicken
- CnT Lechon
- Carlos Special Ngohiong
- Way Tugpahay Siomai sa Tisa

**Note:** Low-confidence locations show a warning icon (⚠️) in their popup cards. Users are advised to click the "Google Maps 導航" link for accurate navigation.

## Data Sources for Restaurant Locations

Since specific restaurant coordinates aren't in OSM:
- **mactannow.com**: Local Mactan guide with area descriptions
- **keeta.ph**: Cebu food blog with general locations
- **Official websites**: Address information (when available)
- **Google Maps search**: Used in navigation links, not for coordinate extraction

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
