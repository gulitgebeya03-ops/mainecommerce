import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Boxes, ClipboardList, DollarSign, PackageSearch, Users } from "lucide-react";

const statusStyles = {
  Pending: "bg-amber-50 text-amber-600",
  Processing: "bg-blue-50 text-blue-600",
  Shipped: "bg-indigo-50 text-indigo-600",
  Delivered: "bg-green-50 text-green-600",
};

const Dashboard = () => {
  const { products, orders, customers } = useContext(AppContext);

  const stats = useMemo(() => {
    const deliveredSales = orders
      .filter((order) => order.status === "Delivered")
      .reduce((total, order) => total + (Number(order.total) || 0), 0);
    const totalSales = orders.reduce((total, order) => total + (Number(order.total) || 0), 0);
    const lowStock = products.filter((product) => Number(product.stock) <= 3);

    return [
      { label: "Total orders", value: orders.length, sub: `${orders.filter((order) => order.status !== "Delivered").length} active`, icon: ClipboardList, tone: "bg-gold/10 text-gold" },
      { label: "Total sales", value: `ETB ${totalSales.toLocaleString()}`, sub: `ETB ${deliveredSales.toLocaleString()} delivered`, icon: DollarSign, tone: "bg-green-50 text-green-600" },
      { label: "Total products", value: products.length, sub: `${lowStock.length} low stock`, icon: Boxes, tone: "bg-amber-50 text-amber-600" },
      { label: "Customers", value: customers.length, sub: "guest checkout enabled", icon: Users, tone: "bg-purple-50 text-purple-600" },
    ];
  }, [products, orders, customers]);

  const recentOrders = orders.slice(0, 5);
  const lowStockProducts = products.filter((product) => Number(product.stock) <= 3).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-muted">The essentials: orders, sales, products, and stock risk.</p>
        </div>
        <Link to="/admin/order" className="inline-flex items-center justify-center gap-2 bg-dark text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-semibold">
          <ClipboardList size={16} /> Manage Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-border-light rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.tone}`}>
                <Icon size={18} />
              </div>
              <p className="text-xs uppercase font-semibold text-text-muted tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-dark mt-1">{card.value}</p>
              <p className="text-xs text-text-muted mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-border-light rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
            <h2 className="font-semibold text-dark">Recent Orders</h2>
            <Link to="/admin/order" className="text-sm font-semibold text-gold hover:text-gold/80">View all</Link>
          </div>
          <div className="divide-y divide-border-light">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-dark text-sm">{order.id}</p>
                  <p className="text-sm text-text-muted">{order.customerName} - ETB {(Number(order.total) || 0).toLocaleString()}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[order.status] || "bg-surface text-text-muted"}`}>{order.status}</span>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="p-8 text-center text-text-muted text-sm">No orders yet.</p>}
          </div>
        </section>

        <section className="bg-white border border-border-light rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
            <PackageSearch size={18} className="text-gold" />
            <h2 className="font-semibold text-dark">Low Stock</h2>
          </div>
          <div className="divide-y divide-border-light">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-dark text-sm">{product.name}</p>
                  <p className="text-sm text-text-muted">{product.category}</p>
                </div>
                <span className="text-sm font-bold text-red-500">{product.stock} left</span>
              </div>
            ))}
            {lowStockProducts.length === 0 && <p className="p-8 text-center text-text-muted text-sm">No low-stock products.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
