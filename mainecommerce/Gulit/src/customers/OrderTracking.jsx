import { useState, useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
<<<<<<< HEAD
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTileUrl, getAttribution } from '../services/map';
import { X, PackageCheck, MapPin, Search } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
=======
import { X, Search, PackageCheck, MapPin } from 'lucide-react';
import MapLocation from '../components/MapLocation';
>>>>>>> e0d365b9b0b0e4f76c7a1d4a0be1a2390b517306

export default function OrderTracking({ onClose }) {
  const { orders, currentCustomer, userRole } = useContext(AppContext);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lookupCode, setLookupCode] = useState('');
  const [lookupError, setLookupError] = useState('');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

<<<<<<< HEAD
  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const getStatusIndex = (status) => statuses.indexOf(status);
  const isSignedInCustomer = Boolean(currentCustomer) && userRole === 'customer';
  const visibleOrders = isSignedInCustomer
    ? orders.filter((o) => {
        const ce = String(currentCustomer?.email || '').trim().toLowerCase();
        const cn = String(currentCustomer?.username || currentCustomer?.name || '').trim().toLowerCase();
        const oe = String(o.email || '').trim().toLowerCase();
        const on2 = String(o.customerName || '').trim().toLowerCase();
        return !ce || oe === ce || on2 === cn || on2.includes(cn);
      })
    : orders;

  useEffect(() => { if (isSignedInCustomer && visibleOrders.length > 0 && !selectedOrder) setSelectedOrder(visibleOrders[0]); }, [isSignedInCustomer, visibleOrders, selectedOrder]);
  useEffect(() => { const h = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);
=======
  const handleTrack = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSearchedOrder(null);

    const match = orders.find(o => o.id.toLowerCase() === trackId.trim().toLowerCase());
    if (match) {
      setSearchedOrder(match);
    } else {
      setErrorMsg("No active shipment records found with that matching Order ID.");
    }
  };

  const statuses = ["Pending", "Processing", "Shipped", "Delivered"];
  const getStatusIndex = (status) => Math.max(0, statuses.indexOf(status));
>>>>>>> e0d365b9b0b0e4f76c7a1d4a0be1a2390b517306

  useEffect(() => {
    if (!selectedOrder || !mapRef.current) return;
    const { latitude: lat, longitude: lng } = selectedOrder;
    if (lat == null || lng == null) return;
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    const map = L.map(mapRef.current, { zoomControl: false }).setView([lat, lng], 15);
    L.tileLayer(getTileUrl(), { attribution: getAttribution(), tileSize: 256, maxZoom: 19 }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(`<b>${selectedOrder.deliveryAddress}</b>`).openPopup();
    mapInstance.current = map;
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [selectedOrder]);

  const handleLookup = (e) => {
    e.preventDefault();
    const n = lookupCode.trim().toLowerCase();
    if (!n) { setLookupError('Enter an order number.'); return; }
    const m = visibleOrders.find((o) => String(o.id).toLowerCase() === n);
    if (m) { setSelectedOrder(m); setLookupError(''); } else setLookupError('No order found.');
  };

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-text-primary"><X size={16} /></button>
        <div className="mb-5"><p className="text-[10px] text-gold tracking-widest uppercase font-medium mb-0.5">Orders</p><h3 className="text-lg font-semibold text-text-primary flex items-center gap-2"><PackageCheck size={18} /> Order History</h3></div>

        <form onSubmit={handleLookup} className="mb-4 flex gap-2">
          <input value={lookupCode} onChange={(e) => setLookupCode(e.target.value)} placeholder="Enter order number" className="flex-1 rounded-full border border-border-light px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold transition" />
          <button type="submit" className="flex items-center gap-1.5 rounded-full bg-dark px-4 py-2.5 text-xs font-semibold text-white hover:bg-dark-muted transition"><Search size={14} /> Track</button>
        </form>
        {lookupError && <p className="mb-3 text-[10px] font-medium text-red-500">{lookupError}</p>}

        {visibleOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-light bg-surface p-4 text-sm text-text-muted text-center">No orders yet.</div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {visibleOrders.map((order) => (
              <button key={order.id} type="button" onClick={() => setSelectedOrder(order)} className={`w-full rounded-xl border p-3 text-left transition ${selectedOrder?.id === order.id ? 'border-dark bg-dark text-white' : 'border-border-light hover:border-gold'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div><p className="text-sm font-semibold">{order.id}</p><p className="text-xs opacity-60">{order.date}</p></div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${selectedOrder?.id === order.id ? 'bg-white/20' : 'bg-surface text-text-muted'}`}>{order.status}</span>
                </div>
                <p className="mt-1.5 text-xs opacity-70 line-clamp-1">{order.deliveryAddress}</p>
              </button>
            ))}
          </div>
        )}

        {selectedOrder && (
          <div className="mt-5 space-y-4 animate-fade-in">
            <div className="bg-surface rounded-xl p-4 text-xs space-y-2 border border-border-light">
              <div className="flex justify-between"><span className="text-text-muted">Customer</span><span className="font-semibold text-text-primary">{selectedOrder.customerName}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Destination</span><span className="font-semibold text-text-primary text-right max-w-50 truncate">{selectedOrder.deliveryAddress}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Status</span><span className="font-bold text-gold bg-gold-light px-2 py-0.5 rounded-full text-[10px] uppercase">{selectedOrder.status}</span></div>
            </div>

<<<<<<< HEAD
            {selectedOrder.latitude != null && selectedOrder.longitude != null && (
              <div className="rounded-xl overflow-hidden border border-border-light">
                <div className="flex items-center gap-1.5 bg-surface px-4 py-2 border-b border-border-light"><MapPin size={12} className="text-gold" /><span className="text-[10px] font-semibold text-text-primary uppercase tracking-wider">Delivery Location</span></div>
                <div ref={mapRef} className="h-44 w-full" />
              </div>
            )}
=======
            {Number.isFinite(Number(searchedOrder.latitude)) && Number.isFinite(Number(searchedOrder.longitude)) && (
              <div>
                <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-gray-500 uppercase">
                  <MapPin size={14} className="text-orange-600" /> Delivery Pin
                </div>
                <MapLocation value={searchedOrder} interactive={false} heightClass="h-52" />
              </div>
            )}

            {/* Stepper Graph Timeline Visualizer */}
            <div className="relative pt-4 pb-2">
              <div className="absolute top-7 left-3 right-3 h-0.5 bg-gray-100 -z-10" />
              <div
                className="absolute top-7 left-3 h-0.5 bg-orange-500 -z-10 transition-all duration-500"
                style={{ width: `${(getStatusIndex(searchedOrder.status) / 3) * 100}%` }}
              />
>>>>>>> e0d365b9b0b0e4f76c7a1d4a0be1a2390b517306

            <div className="relative pt-2 pb-1">
              <div className="absolute top-[15px] left-4 right-4 h-0.5 bg-border-light" />
              <div className="absolute top-[15px] left-4 h-0.5 bg-gold transition-all duration-500" style={{ width: `${(getStatusIndex(selectedOrder.status) / 3) * 100}%` }} />
              <div className="flex justify-between">
                {statuses.map((step, idx) => {
                  const active = idx <= getStatusIndex(selectedOrder.status);
                  const current = idx === getStatusIndex(selectedOrder.status);
                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all ${current ? 'bg-gold border-gold text-white scale-110' : active ? 'bg-gold-light border-gold text-gold' : 'bg-white border-border-light text-text-muted'}`}>{idx + 1}</div>
                      <span className={`text-[10px] mt-1.5 font-medium ${active ? 'text-text-primary' : 'text-text-muted'}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

<<<<<<< HEAD
            <div className="border-t border-border-light pt-3">
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">Package Contents</p>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs py-1.5 border-b border-border-light last:border-0">
                  <span className="text-text-primary">{item.name} <span className="text-text-muted">x{item.quantity}</span></span>
                  <span className="font-semibold text-text-primary">ETB {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
=======
            {/* Item Checklist Breakdown Summary */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Package Contents</h4>
              <div className="space-y-1">
                {searchedOrder.items.map(i => (
                  <div key={i.id} className="flex justify-between text-xs text-gray-600 font-medium bg-gray-50/50 p-1.5 rounded">
                    <span>{i.name} <span className="text-gray-400 text-[10px]">x{i.quantity}</span></span>
                    <span className="font-bold text-gray-800">ETB {(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
>>>>>>> e0d365b9b0b0e4f76c7a1d4a0be1a2390b517306
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
