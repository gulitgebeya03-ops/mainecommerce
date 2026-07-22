import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader2, PackageSearch } from "lucide-react";
import { verifyChapaPayment } from "../services/api";

export default function PaymentSuccess() {
  const location = useLocation();
  const [v, setV] = useState({ loading: true, success: false, message: "Verifying your payment...", order: null });
  const txRef = useMemo(() => { const p = new URLSearchParams(location.search); return p.get("tx_ref") || p.get("trx_ref") || p.get("transaction_id"); }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      if (!txRef) { setV({ loading: false, success: false, message: "Payment reference missing. Please contact support.", order: null }); return; }
      try {
        const r = await verifyChapaPayment(txRef);
        if (cancelled) return;
        setV({ loading: false, success: Boolean(r.success), message: r.success ? "Payment confirmed. Your order is being processed." : "Payment not confirmed yet.", order: r.order });
      } catch (err) { if (!cancelled) setV({ loading: false, success: false, message: err.message || "Could not verify payment.", order: null }); }
    }
    verify();
    return () => { cancelled = true; };
  }, [txRef]);

  const Icon = v.loading ? Loader2 : v.success ? CheckCircle : AlertCircle;
  const iconStyle = v.loading ? 'bg-surface text-gold' : v.success ? 'bg-gold-light text-gold' : 'bg-red-50 text-red-500';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-surface">
      <div className="bg-white border border-border-light rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${iconStyle}`}><Icon size={28} className={v.loading ? "animate-spin" : ""} /></div>
        <h1 className="text-lg font-semibold text-text-primary mb-2">{v.loading ? "Checking Payment" : v.success ? "Payment Confirmed" : "Not Confirmed"}</h1>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">{v.message}</p>
        {v.order?.id && (
          <div className="bg-surface rounded-xl p-3 mb-6 border border-border-light">
            <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Tracking ID</p>
            <p className="font-mono text-sm font-bold text-gold mt-1">{v.order.id}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Link to="/" className="bg-dark text-white rounded-full px-4 py-2.5 text-xs font-semibold hover:bg-dark-muted transition text-center">Storefront</Link>
          <Link to="/customer" className="border border-border-light text-text-primary rounded-full px-4 py-2.5 text-xs font-semibold hover:border-gold hover:text-gold transition inline-flex items-center justify-center gap-1.5"><PackageSearch size={14} /> Track Order</Link>
        </div>
      </div>
    </div>
  );
}
