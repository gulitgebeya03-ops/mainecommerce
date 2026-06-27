import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { X, CheckCircle, Info } from 'lucide-react';

export default function Checkout({ onClose }) {
  const { cart, deliveryFee, placeOrder, startChapaPayment } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [successOrderId, setSuccessOrderId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const grandTotal = cartSubtotal + deliveryFee;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Customer name is required.";
    if (paymentMethod === 'CHAPA' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Email is required for Chapa payment.";
    }
    if (!formData.phone.trim()) errs.phone = "Phone number is required.";
    else if (!/^\+?[0-9]{9,13}$/.test(formData.phone.trim())) errs.phone = "Provide a valid contact number.";
    if (!formData.address.trim()) errs.address = "Delivery address is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      if (paymentMethod === 'CHAPA') {
        const checkoutUrl = await startChapaPayment(formData);
        window.location.href = checkoutUrl;
        return;
      }

      const trackingId = await placeOrder(formData);
      setSuccessOrderId(trackingId);
    } catch (err) {
      setErrors({
        submit: err.message || "Payment could not be started. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (successOrderId) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 text-center shadow-2xl animate-scale-up">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500 w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-1">Order Placed Successfully!</h3>
          <p className="text-xs text-gray-500 mb-4">Thank you. Your order has been recorded under the tracking ID below.</p>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 font-mono text-sm font-bold text-orange-600 inline-block px-6 mb-6">
            {successOrderId}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-lg hover:bg-black transition text-sm shadow"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-gray-900">Delivery Information</h3>
              <button type="button" aria-label="Close checkout" onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Almaz Yoseph"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.name && <p className="text-red-500 text-[11px] mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.email && <p className="text-red-500 text-[11px] mt-0.5">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0911XXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.phone && <p className="text-red-500 text-[11px] mt-0.5">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Address</label>
                <textarea
                  rows="3"
                  placeholder="Specific subcity, neighborhood, building/house number details..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full p-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.address ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.address && <p className="text-red-500 text-[11px] mt-0.5">{errors.address}</p>}
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2 text-blue-800">
              <Info size={16} className="shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Payment Method</p>
                <p className="text-blue-600 mt-0.5">Use Cash on Delivery or pay online with Chapa test checkout.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`border rounded-xl p-3 text-left text-xs transition ${paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="block font-black">Cash on Delivery</span>
                <span>Pay at your door</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CHAPA')}
                className={`border rounded-xl p-3 text-left text-xs transition ${paymentMethod === 'CHAPA' ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <span className="block font-black">Chapa</span>
                <span>Pay online</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition mt-6 text-sm shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Processing...' : paymentMethod === 'CHAPA' ? 'Pay with Chapa' : 'Place Order (COD)'}
          </button>
          {errors.submit && <p className="text-red-600 text-xs font-semibold mt-2">{errors.submit}</p>}
        </form>

        <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col justify-between relative">
          <button type="button" aria-label="Close checkout" onClick={onClose} className="hidden md:block absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>

          <div>
            <h3 className="text-base font-black text-gray-900 mb-4">Order Summary</h3>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 mb-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between items-start gap-4 bg-white p-2.5 rounded-lg border border-gray-100 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{item.product.name}</p>
                    <p className="text-gray-400 font-medium mt-0.5">Qty: {item.quantity} x ETB {item.product.price.toLocaleString()}</p>
                  </div>
                  <span className="font-bold text-gray-900 whitespace-nowrap">
                    ETB {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 bg-gray-50">
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>Cart Subtotal:</span>
              <span className="text-gray-800">ETB {cartSubtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-500">
              <span>Flat Delivery Fee:</span>
              <span className="text-gray-800">ETB {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-700">Total Payable Amount:</span>
              <span className="text-xl font-black text-gray-900">ETB {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
