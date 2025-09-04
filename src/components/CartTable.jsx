// src/components/CartTable.jsx
import React from "react";

const CartTable = ({ cart, removeFromCart, handleFinalizeSale }) => {
  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="mb-3">
      <h5>🛒 Cart</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{item.product}</td>
              <td>{item.quantity}</td>
              <td>₹{item.unitPrice}</td>
              <td>₹{item.total}</td>
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
      <div className="text-end fw-bold mb-2">Total: ₹{grandTotal}</div>

      <div className="d-flex gap-2">
        <button onClick={handleFinalizeSale} className="btn btn-success">
          ✅ Finalize Sale
        </button>
      </div>
    </div>
  );
};

export default CartTable;
