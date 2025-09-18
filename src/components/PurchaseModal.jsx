// src/components/PurchaseModal.jsx
import React from "react";

export default function PurchaseModal({ purchase, onClose }) {
  if (!purchase) return null;

  return (
    <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5>Purchase Details</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>
              <b>Supplier:</b> {purchase.supplier} <br />
              <b>Date:</b> {purchase.date}
            </p>
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Cost</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((it, i) => (
                  <tr key={i}>
                    <td>{it.item}</td>
                    <td>{it.quantity}</td>
                    <td>₹{it.cost}</td>
                    <td className="fw-bold">₹{it.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="fw-bold">Total Purchase: ₹{purchase.totalCost}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
