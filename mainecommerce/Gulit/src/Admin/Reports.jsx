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
        <h1 className="text-2xl font-bold text-dark tracking-tight">Reports</h1>
        <p className="text-sm text-text-muted">MVP reports for sales and order status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border-light rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase font-semibold text-text-muted tracking-wider">Orders report</p>
          <p className="text-3xl font-bold text-dark mt-2">{orders.length}</p>
          <p className="text-sm text-text-muted mt-1">total orders</p>
        </div>
        <div className="bg-white border border-border-light rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase font-semibold text-text-muted tracking-wider">Sales report</p>
          <p className="text-3xl font-bold text-dark mt-2">ETB {totalSales.toLocaleString()}</p>
          <p className="text-sm text-text-muted mt-1">all order value</p>
        </div>
        <div className="bg-white border border-border-light rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase font-semibold text-text-muted tracking-wider">Delivered sales</p>
          <p className="text-3xl font-bold text-dark mt-2">ETB {deliveredSales.toLocaleString()}</p>
          <p className="text-sm text-text-muted mt-1">completed orders only</p>
        </div>
      </div>

      <section className="bg-white border border-border-light rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light">
          <h2 className="font-semibold text-dark">Orders by Status</h2>
        </div>
        <div className="p-5 space-y-4">
          {statuses.map((status) => {
            const count = orders.filter((order) => order.status === status).length;
            const width = orders.length ? `${(count / orders.length) * 100}%` : "0%";
            return (
              <div key={status}>
                <div className="flex justify-between text-sm font-semibold text-dark mb-1">
                  <span>{status}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div className="h-full bg-gold rounded-full" style={{ width }} />
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
