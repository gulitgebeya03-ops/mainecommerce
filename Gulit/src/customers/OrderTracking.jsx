// src/customers/OrderTracking.jsx
import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { X, Search, PackageCheck } from 'lucide-react';

export default function OrderTracking({ onClose }) {
  const { orders } = useContext(AppContext);
  const [trackId, setTrackId] = useState("");
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTrack = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSearchedOrder(null);

    const match = orders.find(o => o.id.toLowerCase() === trackId.trim().toLowerCase());
    if (match) {
      setSearchedOrder(match);
    } else {
      setErrorMsg("No active shipment records found with that matching Order ID.");
    }
  };

  const statuses = ["Pending", "Processing", "Shipped", "Delivered"];
  const getStatusIndex = (status) => statuses.indexOf(status);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Close order tracking" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>

        <div className="flex items-center gap-2 mb-4">
          <PackageCheck className="text-orange-600 w-6 h-6" />
          <h3 className="text-base font-black text-gray-900">Track Order Progress</h3>
        </div>

        {/* Action input bar */}
        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter Order Code (e.g. ORD-102)"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
          />
          <button type="submit" className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition">
            <Search size={14} /> Locate
          </button>
        </form>

        {errorMsg && <p className="text-red-500 text-xs font-medium mb-4">{errorMsg}</p>}

        {/* Step Progression Graph Grid */}
        {searchedOrder && (
          <div className="space-y-6 animate-scale-up">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-400 font-medium">Customer Recipient:</span> <span className="font-bold text-gray-800">{searchedOrder.customerName}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 font-medium">Destination Terminal:</span> <span className="font-bold text-gray-800 text-right max-w-50 truncate">{searchedOrder.deliveryAddress}</span></div>
              <div className="flex justify-between"><span className="text-gray-400 font-medium">Current Status Code:</span> <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-[10px] uppercase">{searchedOrder.status}</span></div>
            </div>

            {/* Stepper Graph Timeline Visualizer */}
            <div className="relative pt-4 pb-2">
              <div className="absolute top-7 left-3 right-3 h-0.5 bg-gray-100 -z-10" />
              <div
                className="absolute top-7 left-3 h-0.5 bg-orange-500 -z-10 transition-all duration-500"
                style={{ width: `${(getStatusIndex(searchedOrder.status) / 3) * 100}%` }}
              />

              <div className="flex justify-between items-center text-center">
                {statuses.map((step, idx) => {
                  const isActive = idx <= getStatusIndex(searchedOrder.status);
                  const isCurrent = idx === getStatusIndex(searchedOrder.status);
                  return (
                    <div key={step} className="flex flex-col items-center flex-1 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all duration-300 ${isCurrent ? 'bg-orange-600 border-orange-600 text-white shadow-md scale-110' :
                        isActive ? 'bg-orange-100 border-orange-500 text-orange-600' : 'bg-white border-gray-200 text-gray-400'
                        }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] mt-2 font-bold tracking-tight ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Item Checklist Breakdown Summary */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Package Contents</h4>
              <div className="space-y-1">
                {searchedOrder.items.map(i => (
                  <div key={i.id} className="flex justify-between text-xs text-gray-600 font-medium bg-gray-50/50 p-1.5 rounded">
                    <span>{i.name} <span className="text-gray-400 text-[10px]">×{i.quantity}</span></span>
                    <span className="font-bold text-gray-800">ETB {(i.price * i.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}