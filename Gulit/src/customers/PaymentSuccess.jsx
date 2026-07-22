import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader2, PackageSearch } from "lucide-react";
import { verifyChapaPayment } from "../services/api";

export default function PaymentSuccess() {
  const location = useLocation();
  const [verification, setVerification] = useState({
    loading: true,
    success: false,
    message: "Verifying your Chapa payment...",
    order: null,
  });

  const txRef = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("tx_ref") || params.get("trx_ref") || params.get("transaction_id");
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      if (!txRef) {
        setVerification({
          loading: false,
          success: false,
          message: "Payment reference was missing. Please contact support with your Chapa receipt.",
          order: null,
        });
        return;
      }

      try {
        const result = await verifyChapaPayment(txRef);
        if (cancelled) return;

        setVerification({
          loading: false,
          success: Boolean(result.success),
          message: result.success
            ? "Payment confirmed. Your order is now being processed."
            : "Payment is not confirmed yet. If money was deducted, please try again in a moment.",
          order: result.order,
        });
      } catch (err) {
        if (cancelled) return;
        setVerification({
          loading: false,
          success: false,
          message: err.message || "Could not verify the Chapa payment.",
          order: null,
        });
      }
    }

    verifyPayment();
    return () => { cancelled = true; };
  }, [txRef]);

  const Icon = verification.loading ? Loader2 : verification.success ? CheckCircle : AlertCircle;
  const iconClass = verification.loading
    ? "bg-blue-50 text-blue-600"
    : verification.success
      ? "bg-green-50 text-green-600"
      : "bg-red-50 text-red-600";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 max-w-md w-full text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${iconClass}`}>
          <Icon size={28} className={verification.loading ? "animate-spin" : ""} />
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-2">
          {verification.loading ? "Checking Payment" : verification.success ? "Payment Confirmed" : "Payment Not Confirmed"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {verification.message}
        </p>

        {verification.order?.id && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-6">
            <p className="text-xs text-gray-500 font-bold uppercase">Tracking ID</p>
            <p className="font-mono text-sm font-black text-orange-600 mt-1">{verification.order.id}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Link to="/" className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-bold hover:bg-black">
            Storefront
          </Link>
          <Link to="/customer" className="border border-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-bold hover:bg-gray-50 inline-flex items-center justify-center gap-2">
            <PackageSearch size={16} /> Track Order
          </Link>
        </div>
      </div>
    </div>
  );
}
