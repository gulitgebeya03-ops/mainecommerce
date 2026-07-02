import { useContext, useState } from 'react';
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
import logo1 from './assets/logo1.jpg';
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
  Menu,
  Phone,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import ChatBot from './components/ChatBot';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <nav>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-3">
            <div className="flex items-center justify-between gap-2">
              <Link to="/" className="flex items-center gap-3 select-none group w-fit shrink-0">
                <img src={logo1} alt="GULIT" className="h-12 w-auto object-contain" />
              </Link>

              <div className="flex items-center gap-1">
                {!isAdminRoute && (
                  <Link to="/customer" className="relative p-2 text-white hover:text-orange-400 transition flex items-center">
                    <ShoppingBag size={22} />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-orange-600 text-white rounded-full min-w-5 h-5 px-1 grid place-items-center text-[10px] leading-none font-bold">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-white hover:text-orange-400 transition"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            <div className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:flex lg:items-center lg:justify-between lg:mt-0 mt-3`}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-1 text-xs font-bold">
                <Link to="/" className={storeLinkClass} onClick={() => setMobileMenuOpen(false)}>
                  <Store size={14} /> <span>Storefront</span>
                </Link>

                {isCustomer ? (
                  <button
                    type="button"
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="px-3 py-2 rounded-md flex items-center gap-1.5 transition whitespace-nowrap text-gray-300 hover:bg-gray-800"
                  >
                    <UserRound size={14} /> <span>{currentCustomer?.username || currentCustomer?.email || 'Customer'}</span>
                    <LogOut size={13} />
                  </button>
                ) : !isAdmin && !isSalesman && (
                  <Link to="/customer/auth" className={navLinkClass('/customer/auth')} onClick={() => setMobileMenuOpen(false)}>
                    <UserRound size={14} /> <span>Customer Login</span>
                  </Link>
                )}

                {isAdmin || isSalesman ? (
                  <>
                    {isAdmin && (
                      <>
                        <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')} onClick={() => setMobileMenuOpen(false)}>
                          <LayoutDashboard size={14} /> <span>Dashboard</span>
                        </Link>
                        <Link to="/admin/products" className={navLinkClass('/admin/products')} onClick={() => setMobileMenuOpen(false)}>
                          <Database size={14} /> <span>Products</span>
                        </Link>
                        <Link to="/admin/order" className={navLinkClass('/admin/order')} onClick={() => setMobileMenuOpen(false)}>
                          <ShoppingBag size={14} /> <span>Orders</span>
                        </Link>
                        <Link to="/admin/customers" className={navLinkClass('/admin/customers')} onClick={() => setMobileMenuOpen(false)}>
                          <Users size={14} /> <span>Customers</span>
                        </Link>
                      </>
                    )}
                    {canViewReports && (
                      <Link to="/admin/reports" className={navLinkClass('/admin/reports')} onClick={() => setMobileMenuOpen(false)}>
                        <BarChart3 size={14} /> <span>Reports</span>
                      </Link>
                    )}
                    {isAdmin && (
                      <Link to="/admin/settings" className={navLinkClass('/admin/settings')} onClick={() => setMobileMenuOpen(false)}>
                        <SettingsIcon size={14} /> <span>Delivery</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="px-3 py-2 text-red-300 hover:bg-red-950/30 border border-red-900/40 rounded-md flex items-center gap-1 transition whitespace-nowrap"
                    >
                      <LogOut size={14} /> <span>Exit</span>
                    </button>
                  </>
                ) : (
                  <Link to="/admin/login" className={navLinkClass('/admin/login')} onClick={() => setMobileMenuOpen(false)}>
                    <LogIn size={14} /> <span>Admin Login</span>
                  </Link>
                )}
              </div>
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

      {!isAdminRoute && <ChatBot />}

      <footer className="bg-gray-950 text-gray-300 border-t border-gray-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 w-fit mb-4">
                <img src={logo1} alt="GULIT" className="h-12 w-auto object-contain" />
              </Link>
              <p className="text-sm leading-6 text-gray-400 max-w-md">
                A practical marketplace for browsing products, placing fast orders, and managing sales from one focused dashboard.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="px-3 py-1.5 rounded-md bg-gray-900 border border-gray-800 flex items-center gap-1.5">
                  <Truck size={13} className="text-orange-400" /> Addis Ababa delivery
                </span>
                <span className="px-3 py-1.5 rounded-md bg-gray-900 border border-gray-800 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" /> Secure staff dashboard
                </span>
                <span className="px-3 py-1.5 rounded-md bg-gray-900 border border-gray-800 flex items-center gap-1.5">
                  <CreditCard size={13} className="text-sky-400" /> COD and Chapa
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
