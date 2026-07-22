import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Settings = () => {
  const { deliveryFee, setDeliveryFee } = useContext(AppContext);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark tracking-tight">Delivery Settings</h1>
        <p className="text-sm text-text-muted">Keep delivery simple for the MVP: one flat delivery fee and order status assignment.</p>
      </div>

      <div className="bg-white border border-border-light rounded-xl p-5 shadow-sm">
        <label className="block text-xs font-semibold uppercase text-text-muted tracking-wider mb-2">Flat delivery fee</label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-muted">ETB</span>
          <input
            type="number"
            min="0"
            value={deliveryFee}
            onChange={(event) => setDeliveryFee(Number(event.target.value) || 0)}
            className="w-40 border border-border-light rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
          />
        </div>
        <p className="text-xs text-text-muted mt-3">This fee appears in checkout and order summaries.</p>
      </div>
    </div>
  );
};

export default Settings;
