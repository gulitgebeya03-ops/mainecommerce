import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AppContext } from '../context/AppContext';
import { geocodeFirst, getTileUrl, getAttribution } from '../services/map';
import { X, CheckCircle, MapPin, ChevronDown } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Checkout({ onClose }) {
  const { cart, deliveryFee, placeOrder, startChapaPayment, currentCustomer, userRole } = useContext(AppContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState({});
  const [successOrderId, setSuccessOrderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationHint, setLocationHint] = useState('Click the map to drop a pin at your delivery location.');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const formScrollRef = useRef(null);

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const grandTotal = cartSubtotal + deliveryFee;
  const isSignedInCustomer = Boolean(currentCustomer) && userRole === 'customer';
  const expectedCustomerEmail = String(currentCustomer?.email || '').trim().toLowerCase();

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'Required';
    if (!formData.lastName.trim()) errs.lastName = 'Required';
    const normalizedEmail = formData.email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail) errs.email = 'Required';
    else if (!emailPattern.test(normalizedEmail)) errs.email = 'Invalid email';
    else if (isSignedInCustomer && expectedCustomerEmail && normalizedEmail !== expectedCustomerEmail) errs.email = 'Use your account email';
    if (paymentMethod === 'CHAPA' && !emailPattern.test(normalizedEmail)) errs.email = 'Required for Chapa';
    if (!formData.phone.trim()) errs.phone = 'Required';
    else if (!/^\+?[0-9]{9,13}$/.test(formData.phone.trim())) errs.phone = 'Invalid number';
    if (!formData.address.trim()) errs.address = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isSignedInCustomer) { setErrors({ submit: 'Please sign in first.' }); navigate('/customer/auth'); return; }
    if (!validate()) return;
    setSubmitting(true); setErrors({});
    let coords = {};
    if (selectedLocation) coords = { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude };
    else if (formData.address.trim()) { try { const r = await geocodeFirst(formData.address); if (r) coords = { latitude: r.latitude, longitude: r.longitude }; } catch {} }
    const orderData = { ...formData, name: `${formData.firstName} ${formData.lastName}`.trim() };
    try {
      if (paymentMethod === 'CHAPA') { const url = await startChapaPayment(orderData, coords); window.location.href = url; return; }
      const id = await placeOrder(orderData, coords); setSuccessOrderId(id);
    } catch (err) { setErrors({ submit: err.message || 'Payment failed.' }); } finally { setSubmitting(false); }
  };

  useEffect(() => {
    if (!isSignedInCustomer) return;
    const fullName = String(currentCustomer?.username || currentCustomer?.name || '').trim();
    const parts = fullName.split(/\s+/);
    setFormData((c) => ({ ...c, ...(parts[0] && !c.firstName ? { firstName: parts[0] } : {}), ...((parts.slice(1).join(' ')) && !c.lastName ? { lastName: parts.slice(1).join(' ') } : {}), ...(String(currentCustomer?.email || '').trim() && !c.email ? { email: String(currentCustomer.email).trim().toLowerCase() } : {}) }));
  }, [currentCustomer, isSignedInCustomer]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([9.145, 40.4897], 12);
    L.tileLayer(getTileUrl(), { attribution: getAttribution(), tileSize: 256, maxZoom: 19 }).addTo(map);
    map.on('click', (e) => { setSelectedLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng }); setLocationHint('Pin moved. Click again to adjust.'); });
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; markerRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (selectedLocation) {
      if (markerRef.current) markerRef.current.setLatLng([selectedLocation.latitude, selectedLocation.longitude]);
      else markerRef.current = L.marker([selectedLocation.latitude, selectedLocation.longitude]).addTo(map);
      markerRef.current.bindPopup('Delivery location').openPopup();
      map.setView([selectedLocation.latitude, selectedLocation.longitude], 15);
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (!formData.address.trim() || selectedLocation) return;
    const t = window.setTimeout(async () => { try { const r = await geocodeFirst(formData.address); if (r) setSelectedLocation({ latitude: r.latitude, longitude: r.longitude }); } catch {} }, 600);
    return () => window.clearTimeout(t);
  }, [formData.address, selectedLocation]);

  useEffect(() => { const h = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

  useEffect(() => {
    const el = formScrollRef.current;
    if (!el) return;
    const check = () => { const at = el.scrollHeight - el.scrollTop - el.clientHeight < 40; setShowScrollBtn(!at && el.scrollHeight > el.clientHeight + 60); };
    check(); el.addEventListener('scroll', check, { passive: true });
    return () => el.removeEventListener('scroll', check);
  }, []);

  const scrollToBottom = () => formScrollRef.current?.scrollTo({ top: formScrollRef.current.scrollHeight, behavior: 'smooth' });

  const inputClass = (field) => `w-full px-4 py-3 text-sm border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gold transition ${errors[field] ? 'border-red-400' : 'border-border-light'}`;

  if (successOrderId) {
    return (
      <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center shadow-2xl animate-fade-in">
          <div className="w-14 h-14 bg-gold-light rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-gold w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">Order Placed</h3>
          <p className="text-xs text-text-muted mb-5">Your order has been recorded.</p>
          <div className="bg-surface px-4 py-3 rounded-xl font-mono text-sm font-bold text-dark inline-block mb-6 break-all">{successOrderId}</div>
          <button onClick={onClose} className="w-full bg-dark text-white font-semibold py-3 rounded-full hover:bg-dark-muted transition text-sm">Return to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center overflow-y-auto">
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-4 sm:my-0 overflow-hidden flex flex-col md:flex-row md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Form */}
        <form ref={formScrollRef} onSubmit={handleSubmit} className="w-full md:w-1/2 flex flex-col overflow-y-auto order-2 md:order-1">
          <div className="p-5 sm:p-6 flex-1">
            <div className="flex justify-between items-center mb-5">
              <div>
                <p className="text-[10px] text-gold tracking-widest uppercase font-medium mb-0.5">Step 2</p>
                <h3 className="text-base font-semibold text-text-primary">Delivery Details</h3>
              </div>
              <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-text-primary md:hidden">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5">First Name</label>
                  <input type="text" placeholder="Almaz" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={inputClass('firstName')} />
                  {errors.firstName && <p className="text-red-500 text-[10px] mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5">Last Name</label>
                  <input type="text" placeholder="Yoseph" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={inputClass('lastName')} />
                  {errors.lastName && <p className="text-red-500 text-[10px] mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass('email')} />
                {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5">Phone</label>
                <input type="text" placeholder="0911XXXXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass('phone')} />
                {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-medium text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin size={10} /> Delivery Address
                </label>
                <textarea rows="3" placeholder="Subcity, neighborhood, building..." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`${inputClass('address')} resize-none`} />
                {errors.address && <p className="text-red-500 text-[10px] mt-1">{errors.address}</p>}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Pin on Map</p>
                <span className="text-[10px] text-text-muted">{selectedLocation ? 'Pinned' : 'Optional'}</span>
              </div>
              <p className="text-[10px] text-text-muted mb-2">{locationHint}</p>
              <div ref={mapRef} className="h-40 sm:h-48 w-full rounded-xl overflow-hidden border border-border-light" />
              {selectedLocation && <p className="text-[10px] text-gold font-medium mt-1.5">{selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}</p>}
            </div>

            {!isSignedInCustomer && (
              <div className="mt-4 rounded-xl border border-gold/30 bg-gold-light p-3">
                <p className="text-[10px] font-semibold text-dark uppercase tracking-wide">Sign in required</p>
                <p className="text-[10px] text-text-muted mt-0.5">Sign in to place an order.</p>
                <button type="button" onClick={() => navigate('/customer/auth')} className="text-[10px] font-semibold text-gold mt-1 underline underline-offset-2">Go to sign in</button>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPaymentMethod('COD')} className={`border rounded-xl p-3 text-left text-xs transition ${paymentMethod === 'COD' ? 'border-dark bg-dark text-white' : 'border-border-light text-text-muted hover:border-gold'}`}>
                <span className="block font-semibold">Cash on Delivery</span>
                <span className="text-[10px] opacity-70">Pay at your door</span>
              </button>
              <button type="button" onClick={() => setPaymentMethod('CHAPA')} className={`border rounded-xl p-3 text-left text-xs transition ${paymentMethod === 'CHAPA' ? 'border-dark bg-dark text-white' : 'border-border-light text-text-muted hover:border-gold'}`}>
                <span className="block font-semibold">Chapa</span>
                <span className="text-[10px] opacity-70">Pay online</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 border-t border-border-light space-y-2">
            <button type="submit" disabled={submitting || !isSignedInCustomer} className="w-full bg-dark text-white font-semibold py-3 rounded-full hover:bg-dark-muted transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Processing...' : !isSignedInCustomer ? 'Sign in to Order' : paymentMethod === 'CHAPA' ? 'Pay with Chapa' : 'Place Order'}
            </button>
            <button type="button" onClick={onClose} className="w-full bg-surface text-text-muted font-medium py-3 rounded-full hover:bg-gold-light hover:text-gold transition text-sm">
              Cancel
            </button>
            {errors.submit && <p className="text-red-500 text-[10px] font-medium">{errors.submit}</p>}
          </div>

          {showScrollBtn && (
            <button type="button" onClick={scrollToBottom} className="sticky bottom-0 left-1/2 -translate-x-1/2 mb-3 flex items-center gap-1 bg-dark text-white text-[10px] font-semibold py-2 px-4 rounded-full shadow-lg mx-auto z-10">
              <ChevronDown size={12} /> More
            </button>
          )}
        </form>

        {/* Right: Summary */}
        <div className="w-full md:w-1/2 bg-surface p-5 sm:p-6 flex flex-col justify-between relative overflow-y-auto order-1 md:order-2 border-b md:border-b-0 md:border-l border-border-light max-h-[40vh] md:max-h-none">
          <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center text-text-muted hover:text-text-primary border border-border-light hidden md:flex">
            <X size={14} />
          </button>
          <div>
            <p className="text-[10px] text-gold tracking-widest uppercase font-medium mb-0.5">Order Summary</p>
            <h3 className="text-base font-semibold text-text-primary mb-4">{cart.length} {cart.length === 1 ? 'item' : 'items'}</h3>
            <div className="space-y-2 max-h-[25vh] md:max-h-[35vh] overflow-y-auto mb-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-start gap-3 bg-white p-3 rounded-xl border border-border-light text-xs">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">{item.product.name}</p>
                    <p className="text-text-muted mt-0.5">Qty: {item.quantity} x ETB {item.product.price.toLocaleString()}</p>
                  </div>
                  <span className="font-semibold text-text-primary whitespace-nowrap">ETB {(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border-light pt-4 space-y-2">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Subtotal</span>
              <span className="text-text-primary font-medium">ETB {cartSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>Delivery</span>
              <span className="text-text-primary font-medium">ETB {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border-light">
              <span className="text-sm font-semibold text-text-primary">Total</span>
              <span className="text-xl font-bold text-text-primary">ETB {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
