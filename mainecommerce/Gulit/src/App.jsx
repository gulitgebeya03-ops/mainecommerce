import { useContext, useState } from 'react';
import { Routes, Route, Link, useLocation } from "react-router-dom";
import CustomerHome from "./customers/index";
import CustomerAuth from "./customers/CustomerAuth";
import PaymentSuccess from "./customers/PaymentSuccess";
import About from "./customers/About";
import Wishlist from "./customers/Wishlist";
import { AppContext } from './context/AppContext';
import OrderTracking from './customers/OrderTracking';
import {
  Heart,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  X,
  Search,
} from 'lucide-react';
import ChatBot from './components/ChatBot';

function App() {
  const { currentCustomer, handleLogout, cart, wishlist } = useContext(AppContext);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const location = useLocation();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = (path) =>
    `text-sm font-medium tracking-wide transition-colors duration-200 ${location.pathname === path ? 'text-gold' : 'text-text-primary hover:text-gold'}`;

  const logout = () => {
    handleLogout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-text-primary font-sans antialiased">

      {/* Announcement bar */}
      <div className="bg-dark text-white text-center py-2 text-[11px] tracking-widest uppercase font-medium">
        Free delivery on orders over ETB 10,000
      </div>

      {/* Header */}
      <header className="bg-white border-b border-border-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-dark">
                GULIT <span className="text-gold font-light">GEBEYA</span>
              </span>
            </Link>

            {/* Desktop Nav — Centered */}
            <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              <Link to="/" className={navLinkClass('/')}>Shop</Link>
              <Link to="/about" className={navLinkClass('/about')}>About</Link>
              {currentCustomer && (
                <span className="text-sm text-text-muted cursor-default">
                  {currentCustomer.username || currentCustomer.email}
                </span>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                aria-label="Order history"
                onClick={() => { setIsTrackingOpen(true); setMobileMenuOpen(false); }}
                className="p-2.5 text-text-primary hover:text-gold transition-colors rounded-full hover:bg-gold-light"
              >
                <Truck size={18} strokeWidth={1.5} />
              </button>

              <button
                type="button"
                aria-label="Wishlist"
                onClick={() => { setIsWishlistOpen(true); setMobileMenuOpen(false); }}
                className="relative p-2.5 text-text-primary hover:text-gold transition-colors rounded-full hover:bg-gold-light"
              >
                <Heart size={18} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold text-dark text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                aria-label="Open cart"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-cart-drawer'));
                  if (location.pathname !== '/customer' && location.pathname !== '/') {
                    window.location.href = '/customer';
                  }
                  setMobileMenuOpen(false);
                }}
                className="relative p-2.5 text-text-primary hover:text-gold transition-colors rounded-full hover:bg-gold-light"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-dark text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {currentCustomer ? (
                <button
                  type="button"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="p-2.5 text-text-muted hover:text-gold transition-colors rounded-full hover:bg-gold-light hidden sm:block"
                  aria-label="Sign out"
                >
                  <LogOut size={18} strokeWidth={1.5} />
                </button>
              ) : (
                <Link
                  to="/customer/auth"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-dark text-white text-xs font-medium rounded-full hover:bg-dark-muted transition-colors"
                >
                  <UserRound size={14} strokeWidth={1.5} />
                  Sign In
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-text-primary hover:text-gold transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border-light bg-white animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              <Link to="/" className="block px-3 py-2.5 text-sm font-medium text-text-primary hover:text-gold hover:bg-gold-light rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                Shop
              </Link>
              <Link to="/about" className="block px-3 py-2.5 text-sm font-medium text-text-primary hover:text-gold hover:bg-gold-light rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link to="/customer/auth" className="block px-3 py-2.5 text-sm font-medium text-text-primary hover:text-gold hover:bg-gold-light rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
              {currentCustomer && (
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2.5 text-sm font-medium text-text-muted hover:text-gold hover:bg-gold-light rounded-lg transition">
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/customer" element={<CustomerHome />} />
          <Route path="/about" element={<About />} />
          <Route path="/customer/auth" element={<CustomerAuth />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </main>

      <ChatBot />
      {isTrackingOpen && <OrderTracking onClose={() => setIsTrackingOpen(false)} />}
      {isWishlistOpen && <Wishlist onClose={() => setIsWishlistOpen(false)} />}

      {/* Footer */}
      <footer className="bg-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">

            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="inline-block mb-4">
                <span className="text-xl font-bold tracking-tight text-white">
                  GULIT <span className="text-gold font-light">GEBEYA</span>
                </span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                Your premium marketplace for quality products. Fast delivery, secure payments, and a curated shopping experience.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="px-3 py-1.5 rounded-full border border-gray-700 text-[11px] font-medium text-gray-300 flex items-center gap-1.5">
                  <Truck size={12} className="text-gold" /> Addis Ababa delivery
                </span>
                <span className="px-3 py-1.5 rounded-full border border-gray-700 text-[11px] font-medium text-gray-300 flex items-center gap-1.5">
                  <ShoppingBag size={12} className="text-gold" /> COD & Chapa
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gold mb-4">Shop</h3>
              <div className="space-y-3">
                <Link to="/" className="block text-sm text-gray-400 hover:text-white transition-colors">All Products</Link>
                <Link to="/about" className="block text-sm text-gray-400 hover:text-white transition-colors">About Us</Link>
                <Link to="/customer/auth" className="block text-sm text-gray-400 hover:text-white transition-colors">My Account</Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gold mb-4">Contact</h3>
              <div className="space-y-3">
                <a href="tel:+251900000000" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Phone size={14} /> +251 900 000 000
                </a>
                <a href="mailto:support@gulit.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                  <Mail size={14} /> support@gulit.com
                </a>
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin size={14} /> Addis Ababa, Ethiopia
                </span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <span>&copy; {new Date().getFullYear()} GULIT Gebeya. All rights reserved.</span>
            <span className="font-medium tracking-wide">Crafted with precision.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
