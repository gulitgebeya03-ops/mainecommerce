import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const statuses = ["Pending", "Processing", "Shipped", "Delivered"];

const Reports = () => {
  const { orders } = useContext(AppContext);
  const totalSales = orders.reduce((total, order) => total + (Number(order.total) || 0), 0);
  const deliveredSales = orders
    .filter((order) => order.status === "Delivered")
    .reduce((total, order) => total + (Number(order.total) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">MVP reports for sales and order status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400">Orders report</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{orders.length}</p>
          <p className="text-sm text-gray-500 mt-1">total orders</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400">Sales report</p>
          <p className="text-3xl font-black text-gray-900 mt-2">ETB {totalSales.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">all order value</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
          <p className="text-xs uppercase font-bold text-gray-400">Delivered sales</p>
          <p className="text-3xl font-black text-gray-900 mt-2">ETB {deliveredSales.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">completed orders only</p>
        </div>
      </div>

      <section className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Orders by Status</h2>
        </div>
        <div className="p-5 space-y-4">
          {statuses.map((status) => {
            const count = orders.filter((order) => order.status === status).length;
            const width = orders.length ? `${(count / orders.length) * 100}%` : "0%";
            return (
              <div key={status}>
                <div className="flex justify-between text-sm font-bold text-gray-700 mb-1">
                  <span>{status}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-orange-600 rounded-full" style={{ width }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Reports;
