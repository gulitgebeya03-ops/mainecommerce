// src/customers/index.jsx
import { useState, useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, ShoppingBag, Eye, Plus, Minus, X, HelpCircle, Truck } from 'lucide-react';
import ProductDetails from './ProductDetails';
import Checkout from './Checkout';
import OrderTracking from './OrderTracking';
import { handleProductImageError, productImageFallback } from '../utils/productImages';

export default function CustomerHome() {
  const { products, categories, cart, addToCart, updateCartQuantity, removeFromCart } = useContext(AppContext);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Interaction Modals States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // Active Dynamic Processing Filters
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 font-sans">
      {/* Dynamic Promotion Sub-Header Bar */}
      <div className="bg-orange-600 text-white text-center py-2 text-xs font-semibold px-4 flex justify-between items-center">
        <span>⚡ Quick Payments via Cash on Delivery Enabled Across Towns!</span>
        <button
          onClick={() => setIsTrackingOpen(true)}
          className="bg-orange-700 hover:bg-orange-800 px-3 py-0.5 rounded text-xs flex items-center gap-1 transition"
        >
          <Truck size={12} /> Track Order Status
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Search and Category Module Filtering Component Grid */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by title, spec details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${selectedCategory === "All" ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Listing Component */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <HelpCircle className="mx-auto text-gray-300 w-12 h-12 mb-2" />
            <p className="text-gray-500 font-medium">No matches found for your search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
                <div className="relative bg-gray-100 pt-[100%] overflow-hidden">
                  <img
                    src={product.image || productImageFallback(product.name)}
                    alt={product.name}
                    onError={(event) => handleProductImageError(event, product.name)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                      Sold Out
                    </div>
                  )}
                  {product.tag && product.stock > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow">
                      {product.tag.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{product.category}</span>
                  <h3 className="font-bold text-sm text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-3">{product.description}</p>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                    <div>
                      <span className="text-[11px] block text-gray-400 font-medium">Price</span>
                      <span className="font-extrabold text-base text-gray-900">ETB {product.price.toLocaleString()}</span>
                    </div>
                    <span className={`text-[11px] font-semibold ${product.stock <= 3 ? 'text-red-500' : 'text-gray-400'}`}>
                      {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-4">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="col-span-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition flex items-center justify-center"
                      title="Inspect Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      disabled={product.stock === 0}
                      onClick={() => addToCart(product, 1)}
                      className={`col-span-3 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${product.stock === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Shopping Cart Sidebar Access Button trigger */}
      {cartItemCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-black transition transform hover:scale-105 z-40 flex items-center gap-2 font-bold text-sm"
        >
          <div className="relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse">
              {cartItemCount}
            </span>
          </div>
          <span>ETB {cartTotal.toLocaleString()}</span>
        </button>
      )}

      {/* Shopping Cart Drawer Panel Component */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-orange-600 w-5 h-5" />
                <h2 className="font-extrabold text-base text-gray-800">Your Shopping Cart</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingBag size={48} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Your shopping basket is completely empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <img
                      src={item.product.image || productImageFallback(item.product.name)}
                      alt={item.product.name}
                      onError={(event) => handleProductImageError(event, item.product.name)}
                      className="w-16 h-16 object-cover rounded-lg bg-white border"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-800 truncate">{item.product.name}</h4>
                      <p className="text-xs text-gray-500 mb-1">ETB {item.product.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="bg-white border border-gray-200 p-1 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="bg-white border border-gray-200 p-1 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between items-end h-full">
                      <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-red-500 p-1 transition">
                        <X size={14} />
                      </button>
                      <span className="text-sm font-extrabold text-gray-900 mt-2">
                        ETB {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-gray-600">Cart Total Subtotal:</span>
                  <span className="text-xl font-black text-gray-900">ETB {cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-orange-600 text-white font-bold text-center py-3 rounded-xl hover:bg-orange-700 shadow-md transition"
                >
                  Proceed to Secure Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Embedded Component Modals Layer */}
      {selectedProduct && <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {isCheckoutOpen && <Checkout onClose={() => setIsCheckoutOpen(false)} />}
      {isTrackingOpen && <OrderTracking onClose={() => setIsTrackingOpen(false)} />}
    </div>
  );
}
