import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Settings = () => {
  const { deliveryFee, setDeliveryFee } = useContext(AppContext);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Delivery Settings</h1>
        <p className="text-sm text-gray-500">Keep delivery simple for the MVP: one flat delivery fee and order status assignment.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Flat delivery fee</label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-500">ETB</span>
          <input
            type="number"
            min="0"
            value={deliveryFee}
            onChange={(event) => setDeliveryFee(Number(event.target.value) || 0)}
            className="w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-3">This fee appears in checkout and order summaries.</p>
      </div>
    </div>
  );
};

export default Settings;
