import { useState, useContext, useMemo, useEffect, useRef, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Search, ShoppingBag, Eye, X, Heart,
  SlidersHorizontal, ArrowUpDown, Clock, Minus, Plus,
} from 'lucide-react';
import { SORT_OPTIONS, formatPrice } from '../data/Products';
import ProductDetails from './ProductDetails';
import Checkout from './Checkout';
import OrderTracking from './OrderTracking';
import { handleProductImageError, productImageFallback } from '../utils/productImages';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80',
    tag: 'New Season Collection',
    title: 'Discover',
    titleAccent: 'Elegance',
    subtitle: 'Curated products across 20+ categories, delivered to your doorstep.',
  },
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    tag: 'Premium Quality',
    title: 'Shop the',
    titleAccent: 'Latest',
    subtitle: 'Handpicked styles for the modern lifestyle.',
  },
  {
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80',
    tag: 'Fast Delivery',
    title: 'Style Meets',
    titleAccent: 'Convenience',
    subtitle: 'Free delivery on orders over ETB 10,000.',
  },
];

export default function CustomerHome() {
  const {
    products, categories, cart, addToCart, updateCartQuantity, removeFromCart,
    wishlist, toggleWishlist, isWishlisted,
    recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches,
  } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimerRef = useRef(null);

  const startHeroTimer = useCallback(() => {
    clearInterval(heroTimerRef.current);
    heroTimerRef.current = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startHeroTimer();
    return () => clearInterval(heroTimerRef.current);
  }, [startHeroTimer]);

  const goToSlide = (i) => {
    setHeroIndex(i);
    startHeroTimer();
  };

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
      const matchMin = priceMin === '' || p.price >= Number(priceMin);
      const matchMax = priceMax === '' || p.price <= Number(priceMax);
      return matchCat && matchSearch && matchMin && matchMax;
    });
    switch (sortBy) {
      case 'price_low': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price_high': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'hottest': list = [...list].sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0) || b.stock - a.stock); break;
      case 'newest':
      default: list = [...list].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    }
    return list;
  }, [products, selectedCategory, searchQuery, sortBy, priceMin, priceMax]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const open = () => setIsCartOpen(true);
    window.addEventListener('open-cart-drawer', open);
    return () => window.removeEventListener('open-cart-drawer', open);
  }, []);

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    if (searchQuery.trim()) addRecentSearch(searchQuery.trim());
  }, [searchQuery, addRecentSearch]);

  return (
    <div className="bg-surface min-h-screen">

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative w-full h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden bg-dark">
        {/* Slides */}
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === heroIndex ? 1 : 0, zIndex: i === heroIndex ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt={slide.tag}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              onError={(e) => { e.target.src = 'https://picsum.photos/seed/shop-hero/1600/600'; }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent z-[2]" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          <p className="text-gold text-xs sm:text-sm tracking-[0.3em] uppercase font-medium mb-4 transition-all duration-500">{HERO_SLIDES[heroIndex].tag}</p>
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-4 max-w-3xl transition-all duration-500">
            {HERO_SLIDES[heroIndex].title} <span className="font-semibold italic">{HERO_SLIDES[heroIndex].titleAccent}</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-md font-light transition-all duration-500">
            {HERO_SLIDES[heroIndex].subtitle}
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative w-full max-w-lg">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-full text-sm bg-white text-text-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold shadow-xl"
              />
            </div>
          </form>

          {/* Pagination dots */}
          <div className="flex items-center gap-2 mt-8">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === heroIndex ? 'w-8 bg-gold' : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
            {recentSearches.slice(0, 6).map((q) => (
              <span
                key={q}
                className="inline-flex items-center gap-1 bg-white border border-border-light text-text-muted text-xs px-3 py-1.5 rounded-full cursor-pointer hover:border-gold hover:text-gold transition"
                onClick={() => setSearchQuery(q)}
              >
                {q}
                <button onClick={(e) => { e.stopPropagation(); removeRecentSearch(q); }} className="text-gray-300 hover:text-gold ml-0.5">
                  <X size={10} />
                </button>
              </span>
            ))}
            <button onClick={clearRecentSearches} className="text-xs text-text-muted hover:text-gold ml-1 transition">Clear</button>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-gold text-xs tracking-[0.2em] uppercase font-medium mb-1">Browse</p>
            <h2 className="text-2xl sm:text-3xl font-light text-text-primary">
              All Products
              <span className="text-text-muted text-lg ml-2">({filteredProducts.length})</span>
            </h2>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mb-8 bg-white rounded-2xl border border-border-light p-4 lg:p-5">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`shrink-0 px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${selectedCategory === 'All' ? 'bg-dark text-white' : 'bg-surface text-text-muted hover:bg-gold-light hover:text-gold'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 whitespace-nowrap ${selectedCategory === cat ? 'bg-dark text-white' : 'bg-surface text-text-muted hover:bg-gold-light hover:text-gold'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort + Filter Toggle */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-light">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-gold transition">
              <SlidersHorizontal size={14} />
              {showFilters ? 'Hide Filters' : 'Price Filter'}
            </button>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-medium text-text-muted bg-surface border border-border-light rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold transition"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price Filter */}
          {showFilters && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border-light flex-wrap">
              <span className="text-xs text-text-muted font-medium">Price (ETB):</span>
              <input type="number" min="0" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
                className="w-28 text-xs border border-border-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold transition" />
              <span className="text-gray-300">—</span>
              <input type="number" min="0" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                className="w-28 text-xs border border-border-light rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold transition" />
              {(priceMin || priceMax) && (
                <button onClick={() => { setPriceMin(''); setPriceMax(''); }} className="text-xs text-text-muted hover:text-gold transition">Reset</button>
              )}
            </div>
          )}
        </div>

        {/* ── Product Grid ────────────────────────────────────────────── */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-border-light">
            <p className="text-text-muted font-light text-lg">No products found.</p>
            <p className="text-text-muted text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-6">
            {filteredProducts.map((product) => {
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;
              return (
                <div key={product.id} className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-lg hover:border-gold/30 transition-all duration-300">

                  {/* Image */}
                  <div className="relative aspect-square bg-surface overflow-hidden">
                    <img
                      src={product.image || productImageFallback(product.name)}
                      alt={product.name}
                      onError={(e) => handleProductImageError(e, product.name)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold tracking-widest uppercase">Sold Out</span>
                      </div>
                    )}
                    {product.tag && product.stock > 0 && (
                      <span className="absolute top-3 left-3 bg-dark text-white text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
                        {product.tag}
                      </span>
                    )}
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition-all duration-200 hover:scale-110"
                    >
                      <Heart size={14} className={isWishlisted(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 lg:p-5">
                    <p className="text-[10px] text-text-muted tracking-widest uppercase font-medium mb-1.5">{product.category}</p>
                    <h3 className="text-sm font-semibold text-text-primary line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed">{product.description}</p>

                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-text-primary">{formatPrice(product.price)}</span>
                        {hasDiscount && (
                          <span className="block text-xs text-text-muted line-through mt-0.5">{formatPrice(product.originalPrice)}</span>
                        )}
                      </div>
                      <span className={`text-[11px] font-medium ${product.stock <= 3 ? 'text-red-500' : 'text-text-muted'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product, 1)}
                        className={`flex-1 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                          product.stock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-dark text-white hover:bg-dark-muted'
                        }`}
                      >
                        {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                      </button>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="w-10 h-10 rounded-full border border-border-light flex items-center justify-center text-text-muted hover:text-gold hover:border-gold transition-all duration-200"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cart Drawer ───────────────────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border-light flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Shopping Bag</h2>
                <p className="text-xs text-text-muted mt-0.5">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-text-primary transition">
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-text-muted font-light">Your bag is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 py-3 border-b border-border-light last:border-0">
                    <img
                      src={item.product.image || productImageFallback(item.product.name)}
                      alt={item.product.name}
                      onError={(e) => handleProductImageError(e, item.product.name)}
                      className="w-20 h-20 object-cover rounded-xl bg-surface"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary truncate">{item.product.name}</h4>
                        <p className="text-xs text-text-muted mt-0.5">{formatPrice(item.product.price)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-surface rounded-full px-1 py-0.5">
                          <button onClick={() => updateCartQuantity(item.product.id, -1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary transition">
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-semibold w-5 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.product.id, 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary transition">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-300 hover:text-red-500 transition p-1">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-6 py-5 border-t border-border-light bg-white">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-text-muted">Total</span>
                  <span className="text-xl font-bold text-text-primary">{formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                  className="w-full bg-dark text-white font-semibold text-sm py-3.5 rounded-full hover:bg-dark-muted transition-all duration-200 tracking-wide"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedProduct && <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {isCheckoutOpen && <Checkout onClose={() => setIsCheckoutOpen(false)} />}
      {isTrackingOpen && <OrderTracking onClose={() => setIsTrackingOpen(false)} />}
    </div>
  );
}
