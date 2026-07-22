import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo1.jpg";
import { AppContext } from "../context/AppContext";
import {
  Menu,
  X,
  User,
  ShoppingCart,
  Search,
} from "lucide-react";

function Header() {
  const { cart, isAdminLoggedIn } = useContext(AppContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [search, setSearch] = useState("");

  // Calculate dynamic items in cart aggregate
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    console.log("Searching for:", search);
    // Explicit clean redirect to customer dashboard catalog filter row
    navigate(`/customer?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <>
      <header className="bg-gray-900 text-white shadow-md sticky top-0 z-40">
        {/* Desktop Header */}
        <div className="hidden md:block">
          {/* First Row */}
          <div className="flex items-center justify-between gap-6 px-6 py-3 bg-[#131921]">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img 
                src={logo} 
                alt="logo"
                className="h-14 w-auto object-contain bg-transparent mix-blend-screen"
              />
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-1 bg-white rounded-md overflow-hidden max-w-2xl">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 text-black outline-none text-sm"
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 px-5 text-black transition flex items-center justify-center"
              >
                <Search size={18} />
              </button>
            </form>

            {/* Right Interactive Group */}
            <div className="flex items-center gap-6">
              {/* User Identity Controller */}
              <button
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-2 hover:text-gray-200 transition text-left"
              >
                <User size={22} />
                <div className="text-xs leading-tight">
                  <p className="text-gray-400">Hello,</p>
                  <p className="font-bold text-sm">
                    {isAdminLoggedIn ? "Admin Panel" : "Sign In / Register"}
                  </p>
                </div>
              </button>

              {/* Dynamic Badge Cart Link */}
              <Link
                to="/customer" /* Re-routing path directly to where floating checkout handles exist */
                className="flex items-center gap-2 hover:text-gray-200 transition relative py-1"
              >
                <div className="relative">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold self-end">Cart</span>
              </Link>
            </div>
          </div>

          {/* Second Navigation Links Row */}
          <div className="flex gap-6 px-6 py-2 text-sm font-medium border-t border-gray-800 bg-[#232F3E]">
            <Link to="/" className="hover:text-yellow-400 transition">Shop Home</Link>
            <Link to="/customer" className="hover:text-yellow-400 transition">Customer View</Link>
            <div className="h-4 w-[1px] bg-gray-600 self-center mx-1" /> {/* Visual Separator */}
            <Link to="/admin/dashboard" className="hover:text-yellow-400 transition text-blue-400">Dashboard</Link>
            <Link to="/admin/order" className="hover:text-yellow-400 transition text-blue-400">Orders Manager</Link>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden px-4 py-3 bg-[#131921]">
          <div className="flex items-center justify-between gap-3">
            {/* Hamburger & Logo */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white focus:outline-none"
              >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/">
                <img src={logo} alt="Gulit Logo" className="h-9 w-auto object-contain" />
              </Link>
            </div>

            {/* Dynamic Search Bar Wrap */}
            <form onSubmit={handleSearch} className="flex flex-1 bg-white rounded overflow-hidden max-w-[180px]">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-2 py-1 text-black outline-none text-xs"
              />
              <button type="submit" className="bg-yellow-400 px-2 text-black flex items-center justify-center">
                <Search size={14} />
              </button>
            </form>

            {/* Right Icons Container */}
            <div className="flex items-center gap-4">
              <button onClick={() => setAuthOpen(true)} className="text-white">
                <User size={22} />
              </button>
              <Link to="/customer" className="relative text-white">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-black font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Overlay Menu Drawer */}
          {menuOpen && (
            <div className="flex flex-col gap-3.5 mt-4 bg-gray-800 p-4 rounded-lg text-sm font-medium border border-gray-700">
              <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition">Shop Home</Link>
              <Link to="/customer" onClick={() => setMenuOpen(false)} className="hover:text-yellow-400 transition">Customer Portal</Link>
              <hr className="border-gray-700 my-1" />
              <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="text-blue-400 hover:text-blue-300">Admin Dashboard</Link>
              <Link to="/admin/order" onClick={() => setMenuOpen(false)} className="text-blue-400 hover:text-blue-300">Orders List</Link>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal Container */}
      {authOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-black relative animate-fadeIn">
            <button 
              onClick={() => setAuthOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg"
            >
              &times;
            </button>

            {/* Tab Toggles */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
              <button
                className={`flex-1 py-2 text-sm font-semibold transition ${
                  !showRegister ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setShowRegister(false)}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 text-sm font-semibold transition ${
                  showRegister ? "bg-green-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setShowRegister(true)}
              >
                Register
              </button>
            </div>

            {/* Form Fields Rendering */}
            {!showRegister ? (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input type="email" placeholder="name@example.com" className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                  <input type="password" placeholder="••••••••" className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm mt-2">
                  Access Portal
                </button>
              </form>
            ) : (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" placeholder="Abebe Kebede" className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input type="email" placeholder="name@example.com" className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                  <input type="password" placeholder="Create strong password" className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm mt-2">
                  Create Account
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Header;