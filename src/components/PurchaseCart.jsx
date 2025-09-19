import React from "react";

export default function PurchaseCart({ purchaseCart, handleCompletePurchase, handleRemoveItem }) {
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
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {purchaseCart.map((p, i) => (
            <tr key={p.id || i}>
              <td>{p.item}</td>
              <td>{p.quantity}</td>
              <td>₹{parseFloat(p.cost).toFixed(2)}</td>
              <td className="fw-bold">₹{parseFloat(p.totalCost).toFixed(2)}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemoveItem(p.id)}
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-end">
        <button className="btn btn-success" onClick={handleCompletePurchase}>
          ✅ Complete Purchase
        </button>
      </div>
    </div>
  );
}
