import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InventoryContext } from "../context/InventoryContext";

export default function CustomerDetails() {
  const { id } = useParams();
  const { customers, sales, recordPayment } = useContext(InventoryContext);
  const navigate = useNavigate();

  const cust = customers.find((c) => c.id === +id);
  if (!cust) return <p className="text-danger">Customer not found 🚫</p>;

  // get only this customer's transactions
  const txns = sales.filter((s) => s.customer === cust.name);

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="mb-3">📋 Customer Details</h2>
        <h4 className="mb-3 text-primary">{cust.name}</h4>

        {/* Customer Info */}
        <div className="row mb-3">
          <div className="col-md-6">
            {cust.billingAddress && <p>🏠 <strong>Billing:</strong> {cust.billingAddress}</p>}
            {cust.shippingAddress && <p>📦 <strong>Shipping:</strong> {cust.shippingAddress}</p>}
            {cust.contactPhone && <p>📞 <strong>Phone:</strong> {cust.contactPhone}</p>}
            {cust.gstin && <p>🧾 <strong>GSTIN:</strong> {cust.gstin}</p>}
          </div>
          <div className="col-md-6">
            <div className="border p-3 rounded bg-light">
              <p><strong>Total Purchased:</strong> ₹{cust.totalPurchase}</p>
              <p><strong>Paid:</strong> ₹{cust.paidAmount}</p>
              <p>
                <strong>Pending:</strong>{" "}
                <span className="text-danger fw-bold">₹{cust.pendingAmount}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <h5 className="mt-4">📑 Transactions</h5>
        {txns.length === 0 ? (
          <p className="text-muted">No transactions found 🚫</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered mt-2">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Amount (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t, i) => (
                  <tr key={t.id}>
                    <td>{i + 1}</td>
                    <td>{t.date}</td>
                    <td className="fw-bold">₹{t.totalAmount}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => navigate(`/bill/${t.id}`)}
                      >
                        View Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Record Payment Option */}
        {cust.pendingAmount > 0 && (
          <div className="mt-3">
            <button
              className="btn btn-success"
              onClick={() => {
                const amt = parseFloat(prompt("Enter payment amount (₹):"));
                if (!isNaN(amt) && amt > 0) {
                  recordPayment(cust.id, amt);
                } else {
                  alert("Invalid amount entered!");
                }
              }}
            >
              💵 Record Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
