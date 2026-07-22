import { BarChart3, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchReports } from '../services/api';

const RANGE_OPTIONS = [
  { label: 'Last 30 Days', value: '30' },
  { label: 'Last 90 Days', value: '90' },
  { label: 'Last Year', value: '365' },
  { label: 'All Time', value: 'all' },
];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('365');

  useEffect(() => {
    loadReports();
  }, [range]);

  async function loadReports() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchReports(range);
      setReports(data);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-dark tracking-tight mb-8">Reports</h1>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white border border-border-light rounded-lg px-4 py-2">
            <Calendar size={18} className="text-text-muted" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent text-dark text-sm focus:outline-none cursor-pointer"
            >
              {RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Customers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-text-muted text-sm">
                      No report data available
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.month} className="hover:bg-surface/50 transition">
                      <td className="px-6 py-4 text-dark font-semibold text-sm flex items-center gap-2">
                        <BarChart3 size={16} className="text-gold" />
                        {report.month}
                      </td>
                      <td className="px-6 py-4 text-dark font-semibold text-sm flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-500" />
                        {report.sales}
                      </td>
                      <td className="px-6 py-4 text-text-muted text-sm">{report.orders}</td>
                      <td className="px-6 py-4 text-text-muted text-sm">{report.customers}</td>
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
