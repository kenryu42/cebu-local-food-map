import './style.css';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { places, glossary, streetFoodTips, sources, type Place, type Category, type Area } from './data';

// State
let map: maplibregl.Map;
let markers: Map<string, maplibregl.Marker> = new Map();
let activeFilters = {
  areas: new Set<Area>(['mactan', 'cebu-city']),
  categories: new Set<Category>()
};

// Initialize map
function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        'openmaptiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        },
        'terrain': {
          type: 'raster-dem',
          tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
          encoding: 'terrarium',
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#f8f8f8' }
        },
        {
          id: 'raster',
          type: 'raster',
          source: 'openmaptiles',
          paint: { 'raster-opacity': 1 }
        }
      ]
    },
    center: [123.96, 10.30],
    zoom: 11,
    pitch: 45,
    bearing: 0
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.addControl(new maplibregl.ScaleControl(), 'bottom-right');

  map.on('load', () => {
    // Add 3D terrain
    map.addSource('terrain-source', {
      type: 'raster-dem',
      tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom: 14
    });
    
    map.setTerrain({ source: 'terrain-source', exaggeration: 1.5 });

    // Add 3D buildings
    map.addLayer({
      id: 'buildings',
      type: 'fill-extrusion',
      source: {
        type: 'vector',
        url: 'https://demotiles.maplibre.org/tiles/tiles.json'
      },
      'source-layer': 'building',
      paint: {
        'fill-extrusion-color': '#aaa',
        'fill-extrusion-height': ['get', 'render_height'],
        'fill-extrusion-base': ['get', 'render_min_height'],
        'fill-extrusion-opacity': 0.6
      }
    });

    addMarkers();
    updateList();
  });
}

// Create marker HTML with color coding
function createMarkerElement(place: Place): HTMLElement {
  const el = document.createElement('div');
  el.className = 'custom-marker';
  
  let color = '#3b82f6'; // blue
  if (place.categories.includes('lechon')) color = '#ef4444'; // red
  else if (place.categories.includes('bbq')) color = '#f59e0b'; // orange
  else if (place.categories.includes('market')) color = '#8b5cf6'; // purple
  else if (place.categories.includes('lodging')) color = '#10b981'; // green
  else if (place.categories.includes('airport')) color = '#6b7280'; // gray
  
  el.innerHTML = `
    <div style="
      background: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="transform: rotate(45deg); font-size: 18px;">
        ${place.categories.includes('lodging') ? '🏨' : 
          place.categories.includes('airport') ? '✈️' :
          place.categories.includes('market') ? '🏪' : '🍴'}
      </span>
    </div>
  `;
  
  return el;
}

// Create popup content
function createPopupContent(place: Place): string {
  const jparkCoord = [123.9974, 10.2848];
  const distance = calculateDistance(
    jparkCoord[1], jparkCoord[0],
    place.lat, place.lng
  );
  
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.googleQuery)}`;
  
  return `
    <div class="popup-content">
      <h3>${place.name}</h3>
      ${place.recommended ? `<p class="recommended">${place.recommended}</p>` : ''}
      ${place.distance ? `<p class="info">${place.distance}</p>` : ''}
      ${place.hours ? `<p class="info">${place.hours}</p>` : ''}
      <p class="info">距離 J Park: ${distance.toFixed(1)} km</p>
      <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="maps-link">
        🗺️ Google Maps 導航
      </a>
      ${place.coordinateSource === 'approximate' ? 
        `<p class="coord-note">⚠️ 座標為區域參考位置</p>` : ''}
    </div>
  `;
}

// Add markers to map
function addMarkers() {
  places.forEach(place => {
    const el = createMarkerElement(place);
    const popup = new maplibregl.Popup({ offset: 25 })
      .setHTML(createPopupContent(place));
    
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([place.lng, place.lat])
      .setPopup(popup)
      .addTo(map);
    
    markers.set(place.id, marker);
  });
}

// Calculate distance between two coordinates (km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Filter places
function getFilteredPlaces(): Place[] {
  return places.filter(place => {
    // Always show landmarks
    if (place.area === 'landmark') return true;
    
    // Check area filter
    if (!activeFilters.areas.has(place.area)) return false;
    
    // Check category filter (if any categories selected)
    if (activeFilters.categories.size > 0) {
      const hasCategory = place.categories.some(cat => 
        activeFilters.categories.has(cat)
      );
      if (!hasCategory) return false;
    }
    
    return true;
  });
}

// Update marker visibility
function updateMarkers() {
  const filtered = new Set(getFilteredPlaces().map(p => p.id));
  
  markers.forEach((marker, id) => {
    const el = marker.getElement();
    if (filtered.has(id)) {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  });
}

// Update list view
function updateList() {
  const listEl = document.getElementById('place-list')!;
  const filtered = getFilteredPlaces();
  
  // Separate by area
  const mactanPlaces = filtered.filter(p => p.area === 'mactan');
  const cebuPlaces = filtered.filter(p => p.area === 'cebu-city');
  const landmarks = filtered.filter(p => p.area === 'landmark');
  
  listEl.innerHTML = '';
  
  if (landmarks.length > 0) {
    listEl.innerHTML += '<div class="list-section"><h4>地標</h4></div>';
    landmarks.forEach(place => {
      listEl.innerHTML += createListItem(place);
    });
  }
  
  if (mactanPlaces.length > 0) {
    listEl.innerHTML += '<div class="list-section"><h4>麥克坦島</h4></div>';
    mactanPlaces.forEach(place => {
      listEl.innerHTML += createListItem(place);
    });
  }
  
  if (cebuPlaces.length > 0) {
    listEl.innerHTML += '<div class="list-section"><h4>宿務市區</h4></div>';
    cebuPlaces.forEach(place => {
      listEl.innerHTML += createListItem(place);
    });
  }
  
  // Add click handlers
  document.querySelectorAll('.list-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id')!;
      flyToPlace(id);
    });
  });
}

// Create list item HTML
function createListItem(place: Place): string {
  return `
    <div class="list-item" data-id="${place.id}">
      <div class="list-item-name">${place.name}</div>
      ${place.recommended ? 
        `<div class="list-item-desc">${place.recommended}</div>` : ''}
    </div>
  `;
}

// Fly to place on map
function flyToPlace(id: string) {
  const place = places.find(p => p.id === id);
  if (!place) return;
  
  map.flyTo({
    center: [place.lng, place.lat],
    zoom: 15,
    pitch: 60,
    duration: 2000
  });
  
  // Open popup
  const marker = markers.get(id);
  if (marker) {
    marker.togglePopup();
  }
}

// Initialize filters
function initFilters() {
  // Area filters
  document.querySelectorAll<HTMLInputElement>('input[name="area"]').forEach(input => {
    input.checked = activeFilters.areas.has(input.value as Area);
    input.addEventListener('change', () => {
      if (input.checked) {
        activeFilters.areas.add(input.value as Area);
      } else {
        activeFilters.areas.delete(input.value as Area);
      }
      updateMarkers();
      updateList();
    });
  });
  
  // Category filters
  document.querySelectorAll<HTMLInputElement>('input[name="category"]').forEach(input => {
    input.addEventListener('change', () => {
      if (input.checked) {
        activeFilters.categories.add(input.value as Category);
      } else {
        activeFilters.categories.delete(input.value as Category);
      }
      updateMarkers();
      updateList();
    });
  });
}

// Initialize info panel
function initInfoPanel() {
  const glossaryEl = document.getElementById('glossary-content')!;
  glossaryEl.innerHTML = glossary.map(item => `
    <div class="glossary-item">
      <strong>${item.term}</strong>: ${item.description}
    </div>
  `).join('');
  
  const tipsEl = document.getElementById('tips-content')!;
  tipsEl.innerHTML = '<ul>' + streetFoodTips.map(tip => `
    <li>${tip}</li>
  `).join('') + '</ul>';
  
  const sourcesEl = document.getElementById('sources-content')!;
  sourcesEl.innerHTML = sources.map(source => `
    <div class="source-link">
      <a href="${source.url}" target="_blank" rel="noopener noreferrer">
        ${source.title} <span class="source-site">(${source.site})</span>
      </a>
    </div>
  `).join('');
}

// Tab switching
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab')!;
      
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(target)!.classList.add('active');
    });
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initFilters();
  initInfoPanel();
  initTabs();
});
