import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Printer } from "lucide-react";

const statuses = ["Pending", "Processing", "Shipped", "Delivered"];

const badgeClass = {
  Pending: "bg-amber-50 text-amber-700",
  Processing: "bg-blue-50 text-blue-700",
  Shipped: "bg-indigo-50 text-indigo-700",
  Delivered: "bg-green-50 text-green-700",
};

const Orders = () => {
  const { orders, updateOrderStatus } = useContext(AppContext);

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
        <h1 className="text-2xl font-black text-gray-900">Order Management</h1>
        <p className="text-sm text-gray-500">View orders, update delivery status, and print invoices.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Order</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Customer</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Items</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Total</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Status</th>
                <th className="p-4 text-right text-xs uppercase text-gray-400">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-black text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.phoneNumber}</p>
                    <p className="text-xs text-gray-400 max-w-xs truncate">{order.deliveryAddress}</p>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={`${order.id}-${item.id}`} className="text-xs text-gray-600">
                          {item.name} <span className="text-gray-400">x{item.quantity}</span>
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 font-black text-gray-900">ETB {(Number(order.total) || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <span className={`w-fit px-2 py-1 rounded-full text-xs font-bold ${badgeClass[order.status] || "bg-gray-100 text-gray-600"}`}>{order.status}</span>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="border border-gray-200 rounded-lg text-sm px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button type="button" onClick={() => printInvoice(order)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black text-xs font-bold">
                      <Printer size={14} /> Print
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400">No orders yet.</td>
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
