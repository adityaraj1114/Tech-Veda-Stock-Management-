// src/components/PurchaseCart.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PurchaseCart({
  purchaseCart = [],
  handleCompletePurchase,
  handleRemoveItem,
}) {
  const [showSuccess, setShowSuccess] = useState(false);

  // Grand total calculation
  const grandTotal = purchaseCart.reduce(
    (sum, p) => sum + (Number(p.totalCost) || 0),
    0
  );

  const completePurchase = () => {
    if (!purchaseCart.length) return;
    handleCompletePurchase();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  if (!purchaseCart || purchaseCart.length === 0) {
    return (
      <motion.div
        className="alert alert-info text-center rounded-3 shadow-sm p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🛒 No items in the purchase cart.
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card p-3 mb-4 shadow-sm"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h5 className="fw-bold mb-3">🛒 Current Purchase Cart</h5>

      <div style={{ overflowX: "auto" }}>
        <table className="table table-hover table-bordered align-middle text-center">
          <thead className="table-light">
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Cost (₹)</th>
              <th>Total (₹)</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {purchaseCart.map((p, i) => (
                <motion.tr
                  key={p.id || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <td>{p.item}</td>
                  <td>{p.quantity}</td>
                  <td>₹{parseFloat(p.cost).toFixed(2)}</td>
                  <td className="fw-bold text-success">
                    ₹{parseFloat(p.totalCost).toFixed(2)}
                  </td>
                  <td>
                    <motion.button
                      className="btn btn-sm btn-outline-danger"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveItem(p.id)}
                    >
                      ❌
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Grand Total */}
      <div className="text-end fw-bold fs-5 mt-3 mb-3">
        Grand Total: <span className="text-success">₹{grandTotal.toFixed(2)}</span>
      </div>

      {/* Complete Purchase */}
      <div className="d-flex justify-content-end position-relative">
        <motion.button
          className="btn btn-success fw-bold rounded-3 shadow"
          onClick={completePurchase}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ✅ Complete Purchase
        </motion.button>

        {/* Animated success popup */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="position-absolute top-0 end-0 m-3 alert alert-success shadow-sm rounded-3"
              style={{ zIndex: 10 }}
            >
              🎉 Purchase Completed Successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
