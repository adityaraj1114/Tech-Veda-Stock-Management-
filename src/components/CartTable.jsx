// src/components/CartTable.jsx
import React from "react";
import { motion } from "framer-motion";
import { useProfile } from "../context/ProfileContext";

export default function CartTable({ cart, removeFromCart, handleFinalizeSale }) {
  const { profile } = useProfile();

  // 🧮 Calculate row-wise totals
  const calculateRowTotal = (item) => {
    const qty = Number(item.quantity) || 0;
    const sellingPrice = Number(item.sellingPrice) || 0;
    const discount = Number(item.discount) || 0; // %
    // ✅ fallback: product gst OR shop default gstPercent
    const gst = Number(item.gst ?? profile.gstPercent) || 0;

    const netPrice = qty * sellingPrice;
    const discountAmount = (discount / 100) * netPrice;
    const afterDiscount = netPrice - discountAmount;
    const gstAmount = (gst / 100) * afterDiscount;
    const finalTotal = afterDiscount + gstAmount;

    return {
      netPrice,
      discountAmount,
      gstAmount,
      finalTotal,
    };
  };

  // 🧮 Calculate Grand Total
  const grandTotal = cart.reduce(
    (sum, item) => sum + calculateRowTotal(item).finalTotal,
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
        background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
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
              <th>Selling Price (₹)</th>
              <th>Discount (%)</th>
              <th>GST (%)</th>
              <th>Total (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, i) => {
              const { finalTotal } = calculateRowTotal(item);

              return (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <td>{i + 1}</td>
                  <td className="fw-semibold">{item.product}</td>
                  <td>{item.quantity}</td>
                  <td>₹{Number(item.sellingPrice || 0).toFixed(2)}</td>
                  <td>{item.discount || 0}%</td>
                  <td>{item.gst ?? profile.gstPercent}%</td>
                  <td className="text-success fw-bold">
                    ₹{finalTotal.toFixed(2)}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grand Total */}
      <div className="text-end fw-bold fs-5 mt-3 mb-3 text-white">
        Grand Total:{" "}
        <span className="text-white">₹{grandTotal.toFixed(2)}</span>
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
