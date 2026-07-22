import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Customers = () => {
  const { customers, orders } = useContext(AppContext);

  const ordersFor = (customer) => orders.filter((order) => {
    if (customer.email && order.email) {
      return order.email.toLowerCase() === customer.email.toLowerCase();
    }
    return customer.phone && order.phoneNumber === customer.phone;
  });

  const orderCountFor = (customer) => ordersFor(customer).length;
  const salesFor = (customer) => ordersFor(customer)
    .reduce((total, order) => total + (Number(order.total) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Customer Management</h1>
        <p className="text-sm text-gray-500">View registered customers from the database plus guest checkout customers.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Customer</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Email</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Phone</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Address</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Source</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Orders</th>
                <th className="p-4 text-left text-xs uppercase text-gray-400">Sales</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">{customer.name}</td>
                  <td className="p-4 text-gray-600">{customer.email || "-"}</td>
                  <td className="p-4 text-gray-600">{customer.phone || "-"}</td>
                  <td className="p-4 text-gray-500 max-w-sm truncate">{customer.address || "-"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${customer.source === "registered" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                      {customer.source || "guest checkout"}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-gray-900">{orderCountFor(customer)}</td>
                  <td className="p-4 font-semibold text-gray-900">ETB {salesFor(customer).toLocaleString()}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-400">No customers yet.</td>
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
