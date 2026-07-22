import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, ChevronDown, Trash2, RefreshCw, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchOrders, updateOrderStatus, deleteOrder } from '../services/api';
import { getTileUrl, getAttribution } from '../services/map';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function OrderLocationMap({ order }) {
  const mapRef = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    const lat = order.latitude;
    const lng = order.longitude;
    if (lat == null || lng == null) return;
    if (!mapRef.current) return;

    if (instance.current) {
      instance.current.remove();
      instance.current = null;
    }

    const map = L.map(mapRef.current, { zoomControl: false }).setView([lat, lng], 15);
    L.tileLayer(getTileUrl(), { attribution: getAttribution(), tileSize: 256, maxZoom: 19 }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(`<b>${order.address || 'Delivery location'}</b>`).openPopup();
    instance.current = map;

    window.setTimeout(() => { map.invalidateSize(); }, 0);

    return () => {
      if (instance.current) {
        instance.current.remove();
        instance.current = null;
      }
    };
  }, [order]);

  if (order.latitude == null || order.longitude == null) return null;

  return (
    <div className="rounded-lg overflow-hidden border border-border-light mt-2">
      <div ref={mapRef} className="h-48 w-full" />
    </div>
  );
}

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_STYLES = {
  Delivered:  'bg-green-50 text-green-600',
  Pending:    'bg-amber-50 text-amber-600',
  Processing: 'bg-blue-50 text-blue-600',
  Shipped:    'bg-purple-50 text-purple-600',
};

function StatusSelect({ orderId, current, onUpdate }) {
  const [busy, setBusy] = useState(false);

  const handleChange = async (e) => {
    const next = e.target.value;
    if (next === current) return;
    setBusy(true);
    try {
      await onUpdate(orderId, next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      <select
        value={current}
        onChange={handleChange}
        disabled={busy}
        className="appearance-none bg-surface border border-border-light text-dark text-sm rounded-lg px-3 py-1.5 pr-7 focus:ring-2 focus:ring-gold/30 focus:border-gold disabled:opacity-50 cursor-pointer"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2 pointer-events-none text-text-muted" />
      {busy && <RefreshCw size={14} className="animate-spin text-gold" />}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('All');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (id, status) => {
    const updated = await updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order permanently?')) return;
    await deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const q = search.toLowerCase();
  const visible = orders.filter((o) => {
    const matchesFilter = filter === 'All' || o.status === filter;
    const matchesSearch = !q
      || o.customer.toLowerCase().includes(q)
      || o.orderCode.toLowerCase().includes(q)
      || o.email.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-dark tracking-tight">Orders</h1>
          <button
            onClick={load}
            className="flex items-center gap-2 bg-surface hover:bg-border-light text-dark px-4 py-2 rounded-lg transition text-sm font-medium border border-border-light"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">Failed to load orders: {error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-2.5 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, order code..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-border-light rounded-lg text-dark placeholder-text-muted focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', ...STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  filter === s
                    ? 'bg-dark text-white'
                    : 'bg-white border border-border-light text-text-muted hover:border-dark hover:text-dark'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border-light rounded-xl overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-text-muted">
              <RefreshCw size={24} className="animate-spin mr-3" /> Loading orders...
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-16 text-text-muted">No orders found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {visible.map((order) => (
                  <tr key={order.id} className="hover:bg-surface/50 transition">
                    <td className="px-4 py-4 text-gold font-mono text-sm font-semibold">
                      {order.orderCode}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark font-medium text-sm">{order.customer}</p>
                      <p className="text-text-muted text-xs">{order.email}</p>
                      {order.latitude != null && order.longitude != null && (
                        <button
                          type="button"
                          onClick={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-gold hover:text-gold/80 transition"
                        >
                          <MapPin size={12} />
                          {expandedOrderId === order.id ? 'Hide Location' : 'Show Location'}
                        </button>
                      )}
                      {expandedOrderId === order.id && (
                        <OrderLocationMap order={order} />
                      )}
                    </td>
                    <td className="px-4 py-4 text-dark font-semibold text-sm">
                      ETB {Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-50 text-green-600'
                          : order.paymentStatus === 'failed'
                          ? 'bg-red-50 text-red-500'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.paymentMethod} / {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusSelect
                        orderId={order.id}
                        current={order.status}
                        onUpdate={handleStatusUpdate}
                      />
                    </td>
                    <td className="px-4 py-4 text-text-muted text-sm">{order.date}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-red-500"
                        title="Delete order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-3 text-text-muted text-sm">
          Showing {visible.length} of {orders.length} orders
        </p>
      </div>
    </div>
  );
}
