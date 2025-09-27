// src/components/PurchaseModal.jsx
import React from "react";

export default function PurchaseModal({ purchase, onClose }) {
  if (!purchase) return null;

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        background: "rgba(0,0,0,0.5)",
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div
          className="modal-content rounded-4 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
            color: "#fff",
          }}
        >
          <div className="modal-header border-0">
            <h5 className="fw-bold">📝 Purchase Details</h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <p className="mb-1">
                <b>Supplier:</b> {purchase.supplier}
              </p>
              <p className="mb-1">
                <b>Date:</b> {purchase.date}
              </p>
            </div>

            <div className="table-responsive">
              <table className="table table-sm table-hover text-white">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Buying Price (₹)</th>
                    <th>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.item}</td>
                      <td>{it.quantity}</td>
                      <td>₹{parseFloat(it.buyingPrice).toFixed(2)}</td>
                      <td className="fw-bold">
                        ₹{parseFloat(it.totalCost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="fw-bold fs-5 text-end">
              Total Purchase: ₹{parseFloat(purchase.totalCost).toFixed(2)}
            </p>
          </div>

          <div className="modal-footer border-0">
            <button
              className="btn btn-gradient rounded-pill fw-bold"
              onClick={onClose}
              style={{
                background: "linear-gradient(45deg, #ff416c, #ff4b2b)",
                color: "#fff",
                border: "none",
                transition: "0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background =
                  "linear-gradient(45deg, #ff4b2b, #ff416c)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background =
                  "linear-gradient(45deg, #ff416c, #ff4b2b)")
              }
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
