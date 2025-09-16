// src/components/CartTable.jsx
import React from "react";

export default function CartTable({ cart, removeFromCart, handleFinalizeSale }) {
  // 🧮 Calculate Grand Total (NaN safe)
  const grandTotal = cart.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );

  if (!cart || cart.length === 0) {
    return (
      <div className="alert alert-info text-center">
        🛒 Cart is empty. Add items to proceed.
      </div>
    );
  }

  return (
    <div className="mb-3">
      <h5>🛒 Cart</h5>

      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price (₹)</th>
            <th>Total (₹)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{item.product}</td>
              <td>{item.quantity}</td>
              <td>₹{Number(item.unitPrice).toFixed(2)}</td>
              <td>₹{Number(item.total).toFixed(2)}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeFromCart(i)}
                >
                  ❌ Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Grand Total */}
      <div className="text-end fw-bold fs-5 mb-3">
        Grand Total: ₹{grandTotal.toFixed(2)}
      </div>

      {/* Finalize Sale */}
      <div className="d-flex justify-content-end">
        <button
          onClick={handleFinalizeSale}
          className="btn btn-success"
          disabled={cart.length === 0}
        >
          ✅ Finalize Sale
        </button>
      </div>
    </div>
  );
}
