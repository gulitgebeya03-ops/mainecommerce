import { useEffect, useState } from 'react';
import { BarChart3, ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';
import { fetchStats } from '../services/api';

function StatCard({ label, value, icon: Icon, loading }) {
  return (
    <div className="bg-white border border-border-light rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-muted text-sm font-medium">{label}</h3>
        <div className="bg-gold/10 p-3 rounded-lg">
          <Icon size={20} className="text-gold" />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-surface rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-dark">{value}</p>
      )}
    </div>
  );
}

function formatCurrency(n) {
  if (n >= 1_000_000) return `ETB ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `ETB ${(n / 1_000).toFixed(1)}K`;
  return `ETB ${Number(n).toLocaleString()}`;
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Total Orders',
      value: stats ? stats.totalOrders.toLocaleString() : '—',
      icon: ShoppingBag,
    },
    {
      label: 'Total Customers',
      value: stats ? stats.totalCustomers.toLocaleString() : '—',
      icon: Users,
    },
    {
      label: 'Total Products',
      value: stats ? stats.totalProducts.toLocaleString() : '—',
      icon: Package,
    },
    {
      label: 'Revenue (Delivered)',
      value: stats ? formatCurrency(stats.revenue) : '—',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark tracking-tight">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Overview of your store performance</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">Failed to load stats: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} loading={loading} />
          ))}
        </div>

        <div className="bg-white border border-border-light rounded-xl p-8">
          <h2 className="text-lg font-bold text-dark mb-3">Welcome to Admin Dashboard</h2>
          <p className="text-text-muted text-sm mb-4">
            Manage your e-commerce store efficiently. Use the sidebar to navigate through different sections:
          </p>
          <ul className="text-text-muted text-sm space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <strong className="text-dark">Products</strong> — Add, edit, or delete products
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <strong className="text-dark">Orders</strong> — View and manage customer orders
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <strong className="text-dark">Customers</strong> — Browse customer accounts
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <strong className="text-dark">Reports</strong> — View monthly sales analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <strong className="text-dark">Settings</strong> — Configure store settings
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
