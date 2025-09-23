// src/components/BillPreview.jsx
import React from "react";
import { useProfile } from "../context/ProfileContext";

export default function BillPreview({
  shareBillOnWhatsApp,
  downloadBillPDF,
  setShowBillFor,
  showBillFor,
  transactions,
}) {
  const { profile } = useProfile();
  const shopName = profile?.shopName || "My Shop";

  // Currency formatter
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  // Find the transaction to preview
  const currentTx = transactions.find((t) => t.id === showBillFor);
  if (!showBillFor || !currentTx) return null;

  // Calculate totals
  const grandTotal =
    currentTx.items?.reduce(
      (sum, it) => sum + (it.unitPrice || 0) * (it.quantity || 0),
      0
    ) || 0;

  const paid =
    typeof currentTx.paid === "number"
      ? currentTx.paid
      : currentTx.items?.reduce((sum, it) => sum + (it.paid || 0), 0) || 0;

  const pending = grandTotal - paid;

  return (
    <>
      <div
        id={`bill_${currentTx.id}`}
        className="border bg-white pt-3 p-3 mb-4 shadow mt-5 rounded"
        style={{ maxWidth: "800px", margin: "auto" }}
      >
        {/* Shop Details Header */}
        <div className="text-center border-bottom pb-2 mb-3">
          <h2 className="mb-1 fw-bold">{shopName}</h2>
          <p className="mb-1">
            <b>Address : </b>
            {[
              profile?.addressLine1 || "Shop Address",
              profile?.addressLine2,
              profile?.city,
              profile?.state,
              profile?.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className="mb-1">
            📞 {profile?.phone || "-"} | <b>GSTIN:</b>{" "}
            {profile?.gstin || "-"}
          </p>
          <small className="text-muted">Tax Invoice</small>
        </div>

        {/* Invoice Meta Info */}
        <div className="d-flex justify-content-between mb-2 lh-sm fw-semibold">
          <span>Invoice ID: {currentTx.id}</span>
          <span>Date: {currentTx.date}</span>
        </div>
        <div className="mb-3 lh-sm">
          <p className="mb-1">
            <b>Customer:</b> {currentTx.customer}
          </p>
          <p className="mb-1">
            <b>Phone:</b> {currentTx.customerInfo?.contactPhone || "-"}
          </p>
          <p className="mb-0">
            <b>Address:</b> {currentTx.customerInfo?.billingAddress || "-"}
          </p>
        </div>

        {/* Items Table */}
        <table className="table table-sm table-bordered">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Description</th>
              <th className="text-center">Qty</th>
              <th className="text-end">Unit Price</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {currentTx.items?.map((it, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{it.product}</td>
                <td className="text-center">{it.quantity}</td>
                <td className="text-end">{formatCurrency(it.unitPrice)}</td>
                <td className="text-end">
                  {formatCurrency((it.unitPrice || 0) * (it.quantity || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="text-end mt-3">
          <h5>Total: {formatCurrency(grandTotal)}</h5>
          <h6 className="text-success">Paid: {formatCurrency(paid)}</h6>
          <h6 className="text-danger">Pending: {formatCurrency(pending)}</h6>
        </div>

        {/* Footer */}
        <div className="text-center border-top mt-4 pt-2">
          <p className="mb-0">
            Thank you for shopping with <b>{shopName}</b>!
          </p>
          <small className="text-muted">
            This is a computer-generated invoice and does not require a
            signature.
          </small>
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex gap-2 mt-3 justify-content-center">
        <button
          className="btn btn-success btn-sm"
          onClick={() => shareBillOnWhatsApp(currentTx)}
        >
          📲 WhatsApp
        </button>
        <button
          className="btn btn-primary btn-sm"
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
