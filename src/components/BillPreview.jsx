// src/components/BillPreview.jsx
import React from "react";
import { useProfile } from "../context/ProfileContext"; // ✅ Profile context import

export default function BillPreview({
  shareBillOnWhatsApp,
  downloadBillPDF,
  setShowBillFor,
  showBillFor,
  transactions,
}) {
  const { profile } = useProfile(); // ✅ profile data access
  const shopName = profile?.shopName || "My Shop"; // fallback

  // ✅ Currency Formatter (INR format)
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  // Find the transaction to preview
  const currentTx = transactions.find((t) => t.id === showBillFor);

  // If no bill is selected or not found, don't render
  if (!showBillFor || !currentTx) return null;

  return (
    <>
      <div
        id={`bill_${currentTx.id}`}
        className="border bg-white pt-3 p-2 mb-4 shadow mt-5"
        style={{ maxWidth: "800px", margin: "auto" }}
      >
        {/* ✅ Shop Details Header */}
        <div className="text-center border-bottom pb-2 mb-3">
          <h2 className="mb-1">{shopName}</h2>
          <p className="mb-1">{profile?.address || "Shop Address"}</p>
          <p className="mb-1">
            📞 {profile?.phone || "-"} | GSTIN: {profile?.gstin || "-"}
          </p>
          <small className="text-muted">Tax Invoice</small>
        </div>

        {/* ✅ Invoice Meta Info */}
        <div className="justify-content-between mb-3">
          <div className="d-flex">
            <p><b>Invoice ID:</b> {currentTx.id}</p>
            <p><b>Date:</b> {currentTx.date}</p>
          </div>
          <div className="text-start">
            <p><b>Customer:</b> {currentTx.customer}</p>
            <p><b>Phone:</b> {currentTx.customerInfo?.contactPhone || "-"}</p>
            <p><b>Address:</b> {currentTx.customerInfo?.billingAddress || "-"}</p>
          </div>
        </div>

        {/* ✅ Items Table */}
        <table className="table table-sm table-bordered">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {currentTx.items?.map((it, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{it.product}</td>
                <td>{it.quantity}</td>
                <td>{formatCurrency(it.unitPrice)}</td>
                <td>{formatCurrency(it.unitPrice * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Totals Section */}
        <div className="text-end mt-3">
          <h5>Total: {formatCurrency(currentTx.total)}</h5>
          <h6 className="text-success">Paid: {formatCurrency(currentTx.paid)}</h6>
          <h6 className="text-danger">Pending: {formatCurrency(currentTx.pending)}</h6>
        </div>

        {/* ✅ Footer */}
        <div className="text-center border-top mt-4 pt-2">
          <p className="mb-0">
            Thank you for shopping with <b>{shopName}</b>!
          </p>
          <small className="text-muted">
            This is a computer-generated invoice and does not require a signature.
          </small>
        </div>
      </div>

      {/* ✅ Actions */}
      <div className="d-flex gap-2 mt-3 justify-content-center">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => shareBillOnWhatsApp(currentTx)}
        >
          📲 WhatsApp
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => downloadBillPDF(currentTx)}
        >
          📄 PDF
        </button>
        <button
          className="btn btn-outline-dark btn-sm"
          onClick={() => setShowBillFor(null)}
        >
          ❌ Close
        </button>
      </div>
    </>
  );
}
