import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Customers = () => {
  const { customers, orders } = useContext(AppContext);

  const ordersFor = (customer) => orders.filter((order) => {
    if (customer.email && order.email) {
      return order.email.toLowerCase() === order.email.toLowerCase();
    }
    return customer.phone && order.phoneNumber === customer.phone;
  });

  const orderCountFor = (customer) => ordersFor(customer).length;
  const salesFor = (customer) => ordersFor(customer)
    .reduce((total, order) => total + (Number(order.total) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark tracking-tight">Customer Management</h1>
        <p className="text-sm text-text-muted">View registered customers from the database plus guest checkout customers.</p>
      </div>

      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Customer</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Email</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Phone</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Address</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Source</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Orders</th>
                <th className="p-4 text-left text-xs font-semibold uppercase text-text-muted tracking-wider">Sales</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-border-light hover:bg-surface/50">
                  <td className="p-4 font-semibold text-dark">{customer.name}</td>
                  <td className="p-4 text-text-muted">{customer.email || "-"}</td>
                  <td className="p-4 text-text-muted">{customer.phone || "-"}</td>
                  <td className="p-4 text-text-muted max-w-sm truncate">{customer.address || "-"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${customer.source === "registered" ? "bg-green-50 text-green-600" : "bg-gold/10 text-gold"}`}>
                      {customer.source || "guest checkout"}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-dark">{orderCountFor(customer)}</td>
                  <td className="p-4 font-semibold text-dark">ETB {salesFor(customer).toLocaleString()}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-text-muted">No customers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
