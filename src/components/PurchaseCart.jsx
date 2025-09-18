// src/components/PurchaseCart.jsx
import React from "react";

export default function PurchaseCart({ purchaseCart, handleCompletePurchase }) {
  return (
    <div className="card p-3 mb-4">
      <h5>🛒 Current Cart</h5>
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
          {purchaseCart.map((p, i) => (
            <tr key={i}>
              <td>{p.item}</td>
              <td>{p.quantity}</td>
              <td>₹{p.cost}</td>
              <td className="fw-bold">₹{p.totalCost}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-success" onClick={handleCompletePurchase}>
        ✅ Complete Purchase
      </button>
    </div>
  );
}
