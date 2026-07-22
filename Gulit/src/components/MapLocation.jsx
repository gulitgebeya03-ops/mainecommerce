import { useEffect, useRef, useState } from 'react';
import { LocateFixed, MapPin } from 'lucide-react';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || 'dDlJvB5twYHptCpjsAar';
const MAPLIBRE_JS = 'https://unpkg.com/maplibre-gl@5.6.1/dist/maplibre-gl.js';
const MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@5.6.1/dist/maplibre-gl.css';
const ADDIS_ABABA = { latitude: 9.03, longitude: 38.74 };

let mapLibrePromise;

function loadMapLibre() {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (mapLibrePromise) return mapLibrePromise;

  mapLibrePromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${MAPLIBRE_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MAPLIBRE_CSS;
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector(`script[src="${MAPLIBRE_JS}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.maplibregl), { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = MAPLIBRE_JS;
    script.async = true;
    script.onload = () => resolve(window.maplibregl);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return mapLibrePromise;
}

export default function MapLocation({
  value,
  onChange,
  interactive = true,
  orders = [],
  selectedOrderId,
  onSelectOrder,
  heightClass = 'h-64',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const orderMarkersRef = useRef([]);
  const onChangeRef = useRef(onChange);
  const interactiveRef = useRef(interactive);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');

  const latitude = Number(value?.latitude);
  const longitude = Number(value?.longitude);
  const hasValue = Number.isFinite(latitude) && Number.isFinite(longitude);
  const center = hasValue ? { latitude, longitude } : ADDIS_ABABA;
  const initialCenterRef = useRef(center);
  const initialHasValueRef = useRef(hasValue);

  useEffect(() => {
    onChangeRef.current = onChange;
    interactiveRef.current = interactive;
  }, [interactive, onChange]);

  useEffect(() => {
    let cancelled = false;

    loadMapLibre()
      .then((maplibregl) => {
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
          center: [initialCenterRef.current.longitude, initialCenterRef.current.latitude],
          zoom: initialHasValueRef.current ? 14 : 11,
          attributionControl: false,
        });

        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        mapRef.current = map;

        map.on('load', () => {
          if (!cancelled) setMapReady(true);
        });

        if (interactiveRef.current) {
          map.on('click', (event) => {
            onChangeRef.current?.({
              latitude: Number(event.lngLat.lat.toFixed(6)),
              longitude: Number(event.lngLat.lng.toFixed(6)),
            });
          });
        }
      })
      .catch(() => {
        if (!cancelled) setMapError('Map could not load. Check your internet connection or MapTiler key.');
      });

    return () => {
      cancelled = true;
      orderMarkersRef.current.forEach((marker) => marker.remove());
      orderMarkersRef.current = [];
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.maplibregl) return;

    if (!hasValue) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const lngLat = [longitude, latitude];
    if (!markerRef.current) {
      markerRef.current = new window.maplibregl.Marker({ color: '#ea580c', draggable: interactive })
        .setLngLat(lngLat)
        .addTo(mapRef.current);

      if (interactive) {
        markerRef.current.on('dragend', () => {
          const markerLngLat = markerRef.current.getLngLat();
          onChangeRef.current?.({
            latitude: Number(markerLngLat.lat.toFixed(6)),
            longitude: Number(markerLngLat.lng.toFixed(6)),
          });
        });
      }
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    mapRef.current.easeTo({ center: lngLat, zoom: Math.max(mapRef.current.getZoom(), 13), duration: 500 });
  }, [hasValue, interactive, latitude, longitude, mapReady, onChange]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.maplibregl) return;

    orderMarkersRef.current.forEach((marker) => marker.remove());
    orderMarkersRef.current = [];

    const validOrders = orders.filter((order) => Number.isFinite(Number(order.latitude)) && Number.isFinite(Number(order.longitude)));

    validOrders.forEach((order) => {
      const marker = new window.maplibregl.Marker({ color: order.id === selectedOrderId ? '#16a34a' : '#111827' })
        .setLngLat([Number(order.longitude), Number(order.latitude)])
        .setPopup(new window.maplibregl.Popup({ offset: 18 }).setHTML(`
          <strong>${order.id}</strong><br/>
          ${order.customerName || 'Customer'}<br/>
          ${order.status || 'Pending'}
        `))
        .addTo(mapRef.current);

      marker.getElement().addEventListener('click', () => onSelectOrder?.(order));
      orderMarkersRef.current.push(marker);
    });

    if (validOrders.length > 1) {
      const bounds = new window.maplibregl.LngLatBounds();
      validOrders.forEach((order) => bounds.extend([Number(order.longitude), Number(order.latitude)]));
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 600 });
    }
  }, [mapReady, onSelectOrder, orders, selectedOrderId]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMapError('Your browser does not support current location.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange?.({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        });
      },
      () => setMapError('Current location permission was not granted. You can click the map instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className={`relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 ${heightClass}`}>
        <div ref={containerRef} className="absolute inset-0" />
        {!mapReady && !mapError && (
          <div className="absolute inset-0 grid place-items-center text-xs font-bold text-gray-500 bg-gray-100">
            Loading map...
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 grid place-items-center p-4 text-center text-xs font-bold text-red-600 bg-red-50">
            {mapError}
          </div>
        )}
        {interactive && (
          <button
            type="button"
            onClick={useCurrentLocation}
            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-bold text-gray-800 shadow hover:bg-gray-50"
          >
            <LocateFixed size={14} /> Current
          </button>
        )}
      </div>
      {interactive && (
        <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
          <MapPin size={13} className="text-orange-600" />
          {hasValue ? `Pinned at ${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'Click the map or use current location to pin delivery position.'}
        </div>
      )}
    </div>
  );
}
