// src/pages/CustomerDetails.jsx
import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCustomer } from "../context/CustomerContext";
import { useSales } from "../context/SalesContext";
import BillPreview from "../components/BillPreview";

export default function CustomerDetails() {
  const { id } = useParams();
  const { customers, recordPayment } = useCustomer();
  const { sales, updateSalePayment } = useSales();

  const [showBillFor, setShowBillFor] = useState(null);

  // -------------------- Find Customer --------------------
  const cust = customers.find((c) => String(c.id) === String(id));
  if (!cust) return <p className="text-danger">Customer not found 🚫</p>;

  // -------------------- Group Sales by Transaction --------------------
  const customerSales = useMemo(() => {
    const grouped = [];
    const map = {};

    sales
      .filter((s) => s.customer === cust.name)
      .forEach((s) => {
        const txKey = s.date + "_" + cust.id;
        if (!map[txKey]) {
          map[txKey] = {
            id: txKey,
            date: s.date,
            items: [],
            totalAmount: 0,
            paid: 0,
            pending: 0,
            customerInfo: s.customerInfo || {},
          };
          grouped.push(map[txKey]);
        }

        map[txKey].items.push({
          product: s.product,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          total: s.total,
        });

        map[txKey].totalAmount += s.total;
        map[txKey].paid += s.paid || 0;
        map[txKey].pending += s.total - (s.paid || 0);
      });

    return grouped;
  }, [sales, cust]);

  // -------------------- Totals --------------------
  const totalPurchased = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalPaid = customerSales.reduce((sum, s) => sum + (s.paid || 0), 0);
  const totalPending = totalPurchased - totalPaid;

  // -------------------- Customer Info Display --------------------
  const displayInfo = {
    name: cust.name,
    billingAddress: cust.billingAddress || "— Not Provided",
    shippingAddress: cust.shippingAddress || "— Not Provided",
    contactPhone: cust.contactPhone || "— Not Provided",
    gstin: cust.gstin || "— Not Provided",
  };

  // -------------------- WhatsApp Notify --------------------
  const notifyOnWhatsApp = () => {
    if (!cust.contactPhone) {
      alert("Customer phone number not available for WhatsApp.");
      return;
    }
    const phone = cust.contactPhone.replace(/\D/g, "");
    const message = `Hello ${cust.name},

Here is your account summary:
Total Purchased: ₹${totalPurchased.toFixed(2)}
Paid: ₹${totalPaid.toFixed(2)}
Pending: ₹${totalPending.toFixed(2)}

Thank you!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // -------------------- Record Payment --------------------
  const handleRecordPayment = () => {
    const amt = parseFloat(prompt("Enter payment amount (₹):"));
    if (!isNaN(amt) && amt > 0) {
      let remaining = amt;

      // ✅ Distribute payment across unpaid sales (FIFO)
      const updatedSales = sales.map((s) => {
        if (s.customer !== cust.name) return s;

        const pending = s.total - (s.paid || 0);
        if (pending <= 0) return s;

        const payNow = remaining >= pending ? pending : remaining;
        remaining -= payNow;

        return {
          ...s,
          paid: parseFloat(((s.paid || 0) + payNow).toFixed(2)),
          pending: parseFloat((pending - payNow).toFixed(2)),
        };
      });

      // ✅ Update sales and customer ledger
      updateSalePayment(updatedSales);

      // ✅ Update recordPayment in CustomerContext if needed
      recordPayment(cust.id, amt, customers);

      alert(`Payment of ₹${amt.toFixed(2)} recorded successfully!`);
    } else {
      alert("Invalid amount entered!");
    }
  };

  return (
    <div className="container mt-3">
      <div className="card shadow p-3">
        <h2 className="mb-3">📋 Customer Details</h2>

        {/* Customer Info */}
        <div className="card mb-4 p-3 bg-light border">
          <h4 className="text-primary">{displayInfo.name}</h4>
          <p>🏠 <strong>Billing Address:</strong> {displayInfo.billingAddress}</p>
          <p>📦 <strong>Shipping Address:</strong> {displayInfo.shippingAddress}</p>
          <p>📞 <strong>Phone:</strong> {displayInfo.contactPhone}</p>
          <p>🧾 <strong>GSTIN:</strong> {displayInfo.gstin}</p>
          <button className="btn btn-sm btn-success mt-2" onClick={notifyOnWhatsApp}>
            📲 Notify on WhatsApp
          </button>
        </div>

        {/* Payment Summary */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="border p-3 rounded bg-white shadow-sm">
              <p><strong>Total Purchased:</strong> ₹{totalPurchased.toFixed(2)}</p>
              <p><strong>Paid:</strong> ₹{totalPaid.toFixed(2)}</p>
              <p><strong>Pending:</strong> <span className="text-danger fw-bold">₹{totalPending.toFixed(2)}</span></p>
            </div>
          </div>
        </div>

        {/* Bill Preview */}
        {showBillFor && (
          <BillPreview
            shareBillOnWhatsApp={(bill) =>
              alert(`Bill #${bill.id} shared on WhatsApp!`)
            }
            downloadBillPDF={(bill) =>
              alert(`Bill #${bill.id} downloaded as PDF!`)
            }
            setShowBillFor={setShowBillFor}
            showBillFor={showBillFor}
            transactions={customerSales}
            tx={customerSales.find((b) => b.id === showBillFor)}
          />
        )}

        {/* Transactions Table */}
        <h5 className="mt-4">📑 Transactions</h5>
        {customerSales.length === 0 ? (
  <p className="text-muted">No transactions 🚫</p>
) : (
  <div className="table-responsive">
    <table className="table table-striped table-bordered">
      <thead className="table-primary">
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Total (₹)</th>
          <th>Paid (₹)</th>
          <th>Pending (₹)</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {customerSales
          .slice() // copy array to avoid mutating original
          .sort((a, b) => new Date(b.date) - new Date(a.date)) // recent first
          .map((bill, i) => (
            <tr key={bill.id}>
              <td>{i + 1}</td>
              <td>{bill.date}</td>
              <td>₹{bill.totalAmount.toFixed(2)}</td>
              <td className="text-success">₹{bill.paid.toFixed(2)}</td>
              <td className="text-danger">
                ₹{(bill.totalAmount - bill.paid).toFixed(2)}
              </td>
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
      <tfoot className="table-secondary fw-bold">
        <tr>
          <td colSpan={2} className="text-end">
            TOTAL
          </td>
          <td>
            ₹{customerSales.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(2)}
          </td>
          <td className="text-success">
            ₹{customerSales.reduce((sum, b) => sum + b.paid, 0).toFixed(2)}
          </td>
          <td className="text-danger">
            ₹{customerSales
              .reduce((sum, b) => sum + (b.totalAmount - b.paid), 0)
              .toFixed(2)}
          </td>
          <td>—</td>
        </tr>
      </tfoot>
    </table>
  </div>
)}

        {/* Record Payment */}
        {totalPending > 0 && (
          <div className="mt-3">
            <button className="btn btn-success" onClick={handleRecordPayment}>
              💵 Record Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
