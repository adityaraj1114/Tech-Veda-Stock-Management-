import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { InventoryContext } from "../context/InventoryContext";
import BillPreview from "../components/BillPreview";

export default function CustomerDetails() {
  const { id } = useParams();
  const { customers = [], sales = [], recordPayment } = useContext(InventoryContext);

  const [showBillFor, setShowBillFor] = useState(null);

  const cust = customers.find((c) => c.id === +id);
  if (!cust) return <p className="text-danger">Customer not found 🚫</p>;

  // Group sales by bill (same date + customer)
  const groupedBills = [];
  const seen = new Set();

  sales
    .filter((s) => s.customer === cust.name)
    .forEach((s) => {
      const key = `${s.date}_${s.customer}`;
      if (!seen.has(key)) {
        const items = sales.filter(
          (x) => x.customer === s.customer && x.date === s.date
        );
        const total = items.reduce((sum, x) => sum + x.totalAmount, 0);
        groupedBills.push({
          id: s.id,
          date: s.date,
          totalAmount: total,
          items,
          customer: s.customer,
          customerInfo: {
            contactPhone: cust.contactPhone,
            billingAddress: cust.billingAddress,
          },
          total: total,
          paid: cust.paidAmount || 0,
          pending: total - (cust.paidAmount || 0),
        });
        seen.add(key);
      }
    });

  // Totals
  const totalPurchased = groupedBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const paid = cust.paidAmount || 0;
  const pending = totalPurchased - paid;

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="mb-3">📋 Customer Details</h2>

        {/* Customer Info */}
        <div className="card mb-4 p-3 bg-light border">
          <h4 className="text-primary">{cust.name}</h4>
          <p>🏠 <strong>Billing Address:</strong> {cust.billingAddress || "— Not Provided"}</p>
          <p>📞 <strong>Phone:</strong> {cust.contactPhone || "— Not Provided"}</p>
          <p>🧾 <strong>GSTIN:</strong> {cust.gstin || "— Not Provided"}</p>
        </div>

        {/* Payment Summary */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="border p-3 rounded bg-white shadow-sm">
              <p><strong>Total Purchased:</strong> ₹{totalPurchased}</p>
              <p><strong>Paid:</strong> ₹{paid}</p>
              <p><strong>Pending:</strong> <span className="text-danger fw-bold">₹{pending}</span></p>
            </div>
          </div>
        </div>

        {/* Bill Preview Modal/Section */}
      {showBillFor && (
        <BillPreview
          shareBillOnWhatsApp={(bill) => console.log("Share", bill)}
          downloadBillPDF={(bill) => console.log("Download", bill)}
          setShowBillFor={setShowBillFor}
          showBillFor={showBillFor}
          transactions={groupedBills}
          totalSales={totalPurchased}
        />
      )}

        {/* Transactions Table */}
        <h5 className="mt-4">📑 Transactions</h5>
        {groupedBills.length === 0 ? (
          <p className="text-muted">No transactions found 🚫</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered mt-2">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Total Amount (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {groupedBills.map((bill, i) => (
                  <tr key={bill.id}>
                    <td>{i + 1}</td>
                    <td>{bill.date}</td>
                    <td className="fw-bold">₹{bill.totalAmount}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => setShowBillFor(bill.id)}
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

        {/* Record Payment */}
        {pending > 0 && (
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
