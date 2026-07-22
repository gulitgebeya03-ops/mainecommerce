import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Heart, ShoppingBag, Eye, Trash2, X } from 'lucide-react';
import { formatPrice } from '../data/Products';
import { handleProductImageError, productImageFallback } from '../utils/productImages';
import ProductDetails from './ProductDetails';

export default function Wishlist({ onClose }) {
  const { wishlist, toggleWishlist, addToCart } = useContext(AppContext);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex justify-center items-start pt-10 sm:pt-20 px-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-in">
        <div className="px-6 py-5 border-b border-border-light flex justify-between items-center">
          <div><p className="text-[10px] text-gold tracking-widest uppercase font-medium mb-0.5">Saved</p><h2 className="text-lg font-semibold text-text-primary">My Wishlist ({wishlist.length})</h2></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-muted hover:text-text-primary transition"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={36} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-medium text-text-primary">Your wishlist is empty.</p>
              <p className="text-xs text-text-muted mt-1">Tap the heart icon on any product to save it here.</p>
            </div>
          ) : (
            wishlist.map((product) => (
              <div key={product.id} className="flex items-center gap-4 bg-surface p-3 rounded-xl border border-border-light">
                <img src={product.image || productImageFallback(product.name)} alt={product.name} onError={(e) => handleProductImageError(e, product.name)} className="w-16 h-16 object-cover rounded-xl bg-white shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-text-muted tracking-wider uppercase">{product.category}</p>
                  <h4 className="text-sm font-semibold text-text-primary truncate">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-text-primary">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && <span className="text-[10px] text-text-muted line-through">{formatPrice(product.originalPrice)}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button onClick={() => setSelectedProduct(product)} className="w-8 h-8 rounded-full border border-border-light flex items-center justify-center text-text-muted hover:text-gold hover:border-gold transition"><Eye size={12} /></button>
                  <button disabled={product.stock === 0} onClick={() => { addToCart(product, 1); toggleWishlist(product); }} className={`w-8 h-8 rounded-full flex items-center justify-center transition ${product.stock === 0 ? 'bg-gray-100 text-text-muted' : 'bg-dark text-white hover:bg-dark-muted'}`}><ShoppingBag size={12} /></button>
                  <button onClick={() => toggleWishlist(product)} className="w-8 h-8 rounded-full border border-border-light flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition"><Trash2 size={12} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {selectedProduct && <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </div>
  );
}
