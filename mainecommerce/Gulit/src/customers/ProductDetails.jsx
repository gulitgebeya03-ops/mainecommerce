import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../data/Products';
import { handleProductImageError, productImageFallback } from '../utils/productImages';

export default function ProductDetails({ product, onClose }) {
  const { addToCart } = useContext(AppContext);
  const [qty, setQty] = useState(1);

  useEffect(() => { const h = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-text-muted hover:text-text-primary shadow transition"><X size={16} /></button>

        {/* Image */}
        <div className="w-full md:w-1/2 bg-surface relative aspect-square md:aspect-auto md:h-full">
          <img src={product.image || productImageFallback(product.name)} alt={product.name} onError={(e) => handleProductImageError(e, product.name)} className="w-full h-full object-cover" />
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-gold tracking-widest uppercase font-medium mb-2">{product.category}</p>
            <h2 className="text-xl font-semibold text-text-primary mb-2">{product.name}</h2>
            <p className="text-xl font-bold text-text-primary mb-4">{formatPrice(product.price)}</p>
            <p className="text-sm text-text-muted leading-relaxed mb-5">{product.description}</p>
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${product.stock <= 3 ? 'bg-red-50 text-red-600' : 'bg-gold-light text-gold'}`}>{product.stock} in stock</span>
              ) : (
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-text-muted">Out of stock</span>
              )}
            </div>
          </div>
          {product.stock > 0 ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Quantity</span>
                <div className="flex items-center bg-surface rounded-full px-1 py-0.5 border border-border-light">
                  <button onClick={() => setQty((p) => Math.max(1, p - 1))} className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary transition"><Minus size={12} /></button>
                  <span className="px-2 text-sm font-semibold w-6 text-center">{qty}</span>
                  <button onClick={() => setQty((p) => Math.min(product.stock, p + 1))} className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary transition"><Plus size={12} /></button>
                </div>
              </div>
              <button onClick={() => { addToCart(product, qty); onClose(); }} className="w-full bg-dark text-white font-semibold py-3 rounded-full hover:bg-dark-muted transition flex items-center justify-center gap-2 text-sm">
                <ShoppingBag size={15} /> Add to Cart — {formatPrice(product.price * qty)}
              </button>
            </div>
          ) : (
            <button disabled className="w-full bg-gray-100 text-text-muted font-medium py-3 rounded-full cursor-not-allowed text-sm">Unavailable</button>
          )}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-text-muted"><ShieldCheck size={12} className="text-gold" /> Genuine Product Warranty</div>
        </div>
      </div>
    </div>
  );
}
