const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '';
const MAPTILER_BASE = 'https://api.maptiler.com';

export const MAPTILER_STYLE = 'streets-v2';

export function getTileUrl() {
  return `https://api.maptiler.com/maps/${MAPTILER_STYLE}/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
}

export function getAttribution() {
  return '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';
}

export async function geocode(query) {
  if (!MAPTILER_KEY) {
    console.warn('MapTiler API key is not set. Add VITE_MAPTILER_API_KEY to .env');
    return [];
  }
  if (!query || !query.trim()) return [];

  const url = `${MAPTILER_BASE}/geocoding/${encodeURIComponent(query.trim())}.json?key=${MAPTILER_KEY}&language=en&limit=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = await res.json();
  return (data.features || []).map((f) => ({
    placeName: f.place_name,
    latitude: f.center[1],
    longitude: f.center[0],
  }));
}

export async function geocodeFirst(query) {
  const results = await geocode(query);
  return results.length > 0 ? results[0] : null;
}
