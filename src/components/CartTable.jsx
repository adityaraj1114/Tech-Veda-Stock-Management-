// src/components/CartTable.jsx
import React from "react";
import { motion } from "framer-motion";

export default function CartTable({ cart, removeFromCart, handleFinalizeSale }) {
  // 🧮 Calculate Grand Total (NaN safe)
  const grandTotal = cart.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );

  if (!cart || cart.length === 0) {
    return (
      <motion.div
        className="alert alert-info text-center rounded-4 shadow-sm p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🛒 Cart is empty. Add items to proceed.
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card shadow-lg border-0 p-4 mb-4"
      style={{
        background: "linear-gradient(135deg, #f3e5f5, #e3f2fd, #e0f7fa)",
        borderRadius: "20px",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h4 className="fw-bold text-primary d-flex align-items-center mb-3">
        🛒 Cart
      </h4>

      <div style={{ overflowX: "auto" }}>
        <table className="table table-hover align-middle text-center shadow-sm rounded-3 overflow-hidden">
          <thead
            className="text-white"
            style={{
              background: "linear-gradient(90deg, #42a5f5, #66bb6a)",
            }}
          >
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
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <td>{i + 1}</td>
                <td className="fw-semibold">{item.product}</td>
                <td>{item.quantity}</td>
                <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                <td className="text-success fw-bold">
                  ₹{Number(item.total).toFixed(2)}
                </td>
                <td>
                  <motion.button
                    className="btn btn-sm btn-danger rounded-3 shadow-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFromCart(i)}
                  >
                    ❌ Remove
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grand Total */}
      <div className="text-end fw-bold fs-5 mt-3 mb-3 text-dark">
        Grand Total:{" "}
        <span className="text-success">₹{grandTotal.toFixed(2)}</span>
      </div>

      {/* Finalize Sale */}
      <div className="d-flex justify-content-end">
        <motion.button
          onClick={handleFinalizeSale}
          className="btn btn-lg btn-success fw-bold rounded-4 shadow"
          disabled={cart.length === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✅ Finalize Sale
        </motion.button>
      </div>
    </motion.div>
  );
}
