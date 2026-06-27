import { useContext } from 'react';
import { Navigate, Routes, Route, Link, useLocation } from "react-router-dom";
import CustomerHome from "./customers/index";
import CustomerAuth from "./customers/CustomerAuth";
import Login from "./Admin/Login";
import Dashboard from "./Admin/Dashboard";
import Orders from "./Admin/Order";
import ProductAdmin from "./Admin/Product";
import Customers from "./Admin/Customers";
import Reports from "./Admin/Reports";
import Settings from "./Admin/Settings";
import PaymentSuccess from "./customers/PaymentSuccess";
import { AppContext } from './context/AppContext';
import {
  BarChart3,
  CreditCard,
  Database,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  Users,
} from 'lucide-react';

function RequireRole({ roles, children }) {
  const { userRole } = useContext(AppContext);
  const location = useLocation();

  if (!roles.includes(userRole)) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function App() {
  const { userRole, currentCustomer, handleLogout, cart } = useContext(AppContext);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdmin = userRole === 'admin';
  const isSalesman = userRole === 'salesman';
  const isCustomer = userRole === 'customer';
  const canViewReports = isAdmin || isSalesman;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinkClass = (path) =>
    `px-3 py-2 rounded-md flex items-center gap-1.5 transition whitespace-nowrap ${location.pathname === path ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`;

  const storeLinkClass =
    `px-3 py-2 rounded-md flex items-center gap-1.5 transition whitespace-nowrap ${!isAdminRoute && ['/', '/customer'].includes(location.pathname) ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`;

  const logout = () => {
    handleLogout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-900 font-sans">
      <header className="bg-gray-950 text-white shadow-md border-b border-gray-800 sticky top-0 z-50">
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] font-semibold text-gray-300">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5">
                <Truck size={13} className="text-orange-400" /> Addis Ababa delivery
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" /> Secure staff dashboard
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a href="tel:+251900000000" className="hover:text-orange-300 transition flex items-center gap-1.5">
                <Phone size={13} /> +251 900 000 000
              </a>
              <a href="mailto:support@gulit.com" className="hover:text-orange-300 transition flex items-center gap-1.5">
                <Mail size={13} /> support@gulit.com
              </a>
            </div>
          </div>
        </div>

        <nav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-3 flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
            <Link to="/" className="flex items-center gap-3 select-none group w-fit">
              <span className="h-10 w-10 rounded-md bg-orange-600 text-white grid place-items-center font-serif font-black text-xl shadow-sm">
                G
              </span>
              <span className="flex flex-col">
                <span className="font-serif font-black text-xl tracking-widest text-white group-hover:text-orange-400 transition duration-200">
                  GULIT
                </span>
                <span className="font-serif text-[10px] tracking-widest text-gray-400 -mt-0.5 uppercase">Gebeya Platform</span>
              </span>
            </Link>

            <div className="flex items-center gap-1 text-xs font-bold overflow-x-auto pb-1 lg:pb-0">
              <Link to="/" className={storeLinkClass}>
                <Store size={14} /> <span>Storefront</span>
              </Link>

              {!isAdminRoute && (
                <Link to="/customer" className="px-3 py-2 rounded-md flex items-center gap-1.5 transition whitespace-nowrap text-gray-300 hover:bg-gray-800">
                  <ShoppingBag size={14} />
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="ml-1 bg-orange-600 text-white rounded-full min-w-5 h-5 px-1 grid place-items-center text-[10px] leading-none">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}

              {isCustomer ? (
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-2 rounded-md flex items-center gap-1.5 transition whitespace-nowrap text-gray-300 hover:bg-gray-800"
                >
                  <UserRound size={14} /> <span>{currentCustomer?.username || currentCustomer?.email || 'Customer'}</span>
                  <LogOut size={13} />
                </button>
              ) : !isAdmin && !isSalesman && (
                <Link to="/customer/auth" className={navLinkClass('/customer/auth')}>
                  <UserRound size={14} /> <span>Customer Login</span>
                </Link>
              )}

              {isAdmin || isSalesman ? (
                <>
                  {isAdmin && (
                    <>
                      <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                        <LayoutDashboard size={14} /> <span>Dashboard</span>
                      </Link>
                      <Link to="/admin/products" className={navLinkClass('/admin/products')}>
                        <Database size={14} /> <span>Products</span>
                      </Link>
                      <Link to="/admin/order" className={navLinkClass('/admin/order')}>
                        <ShoppingBag size={14} /> <span>Orders</span>
                      </Link>
                      <Link to="/admin/customers" className={navLinkClass('/admin/customers')}>
                        <Users size={14} /> <span>Customers</span>
                      </Link>
                    </>
                  )}
                  {canViewReports && (
                    <Link to="/admin/reports" className={navLinkClass('/admin/reports')}>
                      <BarChart3 size={14} /> <span>Reports</span>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin/settings" className={navLinkClass('/admin/settings')}>
                      <SettingsIcon size={14} /> <span>Delivery</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="px-3 py-2 text-red-300 hover:bg-red-950/30 border border-red-900/40 rounded-md flex items-center gap-1 transition whitespace-nowrap"
                  >
                    <LogOut size={14} /> <span>Exit</span>
                  </button>
                </>
              ) : (
                <Link to="/admin/login" className={navLinkClass('/admin/login')}>
                  <LogIn size={14} /> <span>Admin Login</span>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 bg-gray-50">
        <Routes>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/customer/auth" element={<CustomerAuth />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/dashboard" element={<RequireRole roles={['admin']}><Dashboard /></RequireRole>} />
          <Route path="/admin/order" element={<RequireRole roles={['admin']}><Orders /></RequireRole>} />
          <Route path="/admin/products" element={<RequireRole roles={['admin']}><ProductAdmin /></RequireRole>} />
          <Route path="/admin/customers" element={<RequireRole roles={['admin']}><Customers /></RequireRole>} />
          <Route path="/admin/reports" element={<RequireRole roles={['admin', 'salesman']}><Reports /></RequireRole>} />
          <Route path="/admin/settings" element={<RequireRole roles={['admin']}><Settings /></RequireRole>} />
        </Routes>
      </main>

      <footer className="bg-gray-950 text-gray-300 border-t border-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 w-fit mb-4">
                <span className="h-10 w-10 rounded-md bg-orange-600 text-white grid place-items-center font-serif font-black text-xl">
                  G
                </span>
                <span>
                  <span className="block font-serif font-black text-xl tracking-widest text-white">GULIT</span>
                  <span className="block text-[10px] tracking-widest uppercase text-gray-500">Gebeya Platform</span>
                </span>
              </Link>
              <p className="text-sm leading-6 text-gray-400 max-w-md">
                A practical marketplace for browsing products, placing fast orders, and managing sales from one focused dashboard.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="px-3 py-1.5 rounded-md bg-gray-900 border border-gray-800 flex items-center gap-1.5">
                  <Truck size={13} className="text-orange-400" /> Local delivery
                </span>
                <span className="px-3 py-1.5 rounded-md bg-gray-900 border border-gray-800 flex items-center gap-1.5">
                  <CreditCard size={13} className="text-emerald-400" /> COD and Chapa
                </span>
                <span className="px-3 py-1.5 rounded-md bg-gray-900 border border-gray-800 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-sky-400" /> Admin protected
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-white mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link to="/" className="block hover:text-orange-300 transition">Storefront</Link>
                <Link to="/customer/auth" className="block hover:text-orange-300 transition">Customer Login</Link>
                <Link to="/admin/login" className="block hover:text-orange-300 transition">Admin Login</Link>
                {canViewReports && <Link to="/admin/reports" className="block hover:text-orange-300 transition">Reports</Link>}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-white mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                <a href="tel:+251900000000" className="flex items-center gap-2 hover:text-orange-300 transition">
                  <Phone size={14} /> +251 900 000 000
                </a>
                <a href="mailto:support@gulit.com" className="flex items-center gap-2 hover:text-orange-300 transition">
                  <Mail size={14} /> support@gulit.com
                </a>
                <span className="flex items-center gap-2 text-gray-400">
                  <MapPin size={14} /> Addis Ababa, Ethiopia
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-900 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span>Copyright {new Date().getFullYear()} GULIT Gebeya. All rights reserved.</span>
            <span className="font-semibold">Built for fast selling, delivery, and order tracking.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
