// src/customers/ProductDetails.jsx
import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';
import { handleProductImageError, productImageFallback } from '../utils/productImages';

export default function ProductDetails({ product, onClose }) {
  const { addToCart } = useContext(AppContext);
  const [qty, setQty] = useState(1);

  const increment = () => {
    if (qty < product.stock) setQty(p => p + 1);
  };

  const decrement = () => {
    if (qty > 1) setQty(p => p - 1);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible" onClick={(e) => e.stopPropagation()}>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-1.5 rounded-full text-gray-500 hover:text-gray-800 shadow z-10 transition"
        >
          <X size={18} />
        </button>

        {/* Product Images Frame */}
        <div className="w-full md:w-1/2 bg-gray-50 relative pt-[80%] md:pt-0 md:h-auto">
          <img
            src={product.image || productImageFallback(product.name)}
            alt={product.name}
            onError={(event) => handleProductImageError(event, product.name)}
            className="md:absolute md:inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Specification Matrix Panel */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {product.category}
            </span>
            <h2 className="text-xl font-black text-gray-900 mt-2 mb-1">{product.name}</h2>
            <p className="text-2xl font-black text-orange-600 mb-4">ETB {product.price.toLocaleString()}</p>

            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Product Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>

            {/* Available Stock Indicator */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-gray-500">Available Stock Status:</span>
              {product.stock > 0 ? (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${product.stock <= 3 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {product.stock} Units left in Warehouse
                </span>
              ) : (
                <span className="text-xs font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Actions Block */}
          {product.stock > 0 ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <button onClick={decrement} className="px-3 py-1.5 hover:bg-gray-100 text-gray-600 transition"><Minus size={12} /></button>
                  <span className="px-3 text-sm font-extrabold text-gray-800 w-8 text-center">{qty}</span>
                  <button onClick={increment} className="px-3 py-1.5 hover:bg-gray-100 text-gray-600 transition"><Plus size={12} /></button>
                </div>
              </div>

              <button
                onClick={() => {
                  addToCart(product, qty);
                  onClose();
                }}
                className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition flex items-center justify-center gap-2 shadow-md shadow-orange-600/10"
              >
                <ShoppingBag size={16} /> Add to Cart — ETB {(product.price * qty).toLocaleString()}
              </button>
            </div>
          ) : (
            <button disabled className="w-full bg-gray-200 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed text-center">
              Product Currently Unavailable
            </button>
          )}

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <ShieldCheck size={14} className="text-green-500" /> Genuine Product Warranty Guaranteed
          </div>
        </div>

      </div>
    </div>
  );
}
