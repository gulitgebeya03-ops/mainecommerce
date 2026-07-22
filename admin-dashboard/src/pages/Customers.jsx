import { Search, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchCustomers } from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-dark tracking-tight">Customers</h1>
          <span className="text-sm text-text-muted">{customers.length} total</span>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-border-light rounded-lg text-dark placeholder-text-muted focus:ring-2 focus:ring-gold/30 focus:border-gold text-sm"
            />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-gold animate-spin" />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white border border-border-light rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">City</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-text-muted text-sm">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer) => (
                    <tr key={customer.id} className="hover:bg-surface/50 transition">
                      <td className="px-6 py-4 text-dark font-semibold text-sm">{customer.name}</td>
                      <td className="px-6 py-4 text-text-muted text-sm flex items-center gap-2">
                        <Mail size={14} className="text-text-muted/50" />
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 text-text-muted text-sm flex items-center gap-2">
                        <Phone size={14} className="text-text-muted/50" />
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 text-text-muted text-sm flex items-center gap-2">
                        <MapPin size={14} className="text-text-muted/50" />
                        {customer.city}
                      </td>
                      <td className="px-6 py-4 text-dark font-semibold text-sm">{customer.orders}</td>
                      <td className="px-6 py-4 text-text-muted text-sm">{customer.joinedAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
