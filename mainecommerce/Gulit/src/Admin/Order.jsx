import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getTileUrl, getAttribution } from '../services/map';
import { Printer, MapPin } from "lucide-react";

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
    L.marker([lat, lng]).addTo(map).bindPopup(`<b>${order.deliveryAddress}</b>`).openPopup();
    instance.current = map;

    window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

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
      <div ref={mapRef} className="h-32 w-full" />
    </div>
  );
}

const statuses = ["Pending", "Processing", "Shipped", "Delivered"];

const badgeClass = {
  Pending: "bg-amber-50 text-amber-600",
  Processing: "bg-blue-50 text-blue-600",
  Shipped: "bg-indigo-50 text-indigo-600",
  Delivered: "bg-green-50 text-green-600",
};

const Orders = () => {
  const { orders, updateOrderStatus } = useContext(AppContext);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const printInvoice = (order) => {
    const itemRows = order.items
      .map((item) => `${item.name} x ${item.quantity} - ETB ${(item.price * item.quantity).toLocaleString()}`)
      .join("\n");

    const invoice = [
      "GULIT GEBEYA INVOICE",
      `Order: ${order.id}`,
      `Date: ${order.date}`,
      `Customer: ${order.customerName}`,
      `Phone: ${order.phoneNumber}`,
      `Address: ${order.deliveryAddress}`,
      "",
      itemRows,
      "",
      `Subtotal: ETB ${order.subtotal.toLocaleString()}`,
      `Delivery: ETB ${order.deliveryFee.toLocaleString()}`,
      `Total: ETB ${order.total.toLocaleString()}`,
      `Payment: ${order.paymentMethod || "Cash on Delivery (COD)"}`,
      `Status: ${order.status}`,
    ].join("\n");

    const win = window.open("", "_blank", "width=640,height=720");
    if (!win) return;
    win.document.write(`<pre style="font:14px/1.5 monospace; padding:24px; white-space:pre-wrap;">${invoice}</pre>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark tracking-tight">Order Management</h1>
        <p className="text-sm text-text-muted">View orders, update delivery status, and print invoices.</p>
      </div>

      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Order</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Customer</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Items</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Total</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Status</th>
                <th className="p-4 text-right text-xs font-semibold uppercase text-text-muted tracking-wider">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-border-light hover:bg-surface/50">
                  <td className="p-4">
                    <p className="font-bold text-dark">{order.id}</p>
                    <p className="text-xs text-text-muted">{order.date}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-dark">{order.customerName}</p>
                    <p className="text-xs text-text-muted">{order.phoneNumber}</p>
                    <p className="text-xs text-text-muted max-w-xs truncate">{order.deliveryAddress}</p>
                    {order.latitude != null && order.longitude != null && (
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
                        className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-gold hover:text-gold/80"
                      >
                        <MapPin size={11} /> {expandedOrderId === order.id ? 'Hide Location' : 'Show Location'}
                      </button>
                    )}
                    {expandedOrderId === order.id && (
                      <div>
                        <OrderLocationMap order={order} />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={`${order.id}-${item.id}`} className="text-xs text-text-muted">
                          {item.name} <span className="text-text-muted/60">x{item.quantity}</span>
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-dark">ETB {(Number(order.total) || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <span className={`w-fit px-2 py-1 rounded-full text-xs font-semibold ${badgeClass[order.status] || "bg-surface text-text-muted"}`}>{order.status}</span>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="border border-border-light rounded-lg text-sm px-2 py-1.5 bg-surface text-dark focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                      >
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button type="button" onClick={() => printInvoice(order)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-dark text-white hover:bg-gray-800 text-xs font-semibold">
                      <Printer size={14} /> Print
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-text-muted">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
