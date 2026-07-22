const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '';
const MAPTILER_STYLE = 'streets-v2';

export function getTileUrl() {
  return `https://api.maptiler.com/maps/${MAPTILER_STYLE}/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;
}

export function getAttribution() {
  return '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';
}
