import React from "react";
import { motion } from "framer-motion";

/**
 * Props:
 * - open (bool)
 * - onClose()
 * - items: selected array
 * - updateQty(id, qty)
 * - removeItem(id)
 * - grandTotal
 * - onGenerateBill()
 */
export default function CartModal({
  open,
  onClose,
  items = [],
  updateQty,
  removeItem,
  grandTotal = 0,
  onGenerateBill,
}) {
  if (!open) return null;

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="modal-content shadow-lg"
          style={{ borderRadius: "1rem", overflow: "hidden" }}
        >
          {/* Header */}
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(90deg, #00c9ff, #92fe9d)",
              color: "#fff",
            }}
          >
            <h5
              className="modal-title fw-bold"
              style={{
                background: "linear-gradient(90deg, #062229ff, #172e1aff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🛒 Selected Products
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          {/* Body */}
          <div className="modal-body">
            {items.length === 0 ? (
              <p className="text-muted text-center">No products selected.</p>
            ) : (
              <>
                <div className="table-responsive mb-3">
                  <table className="table table-sm align-middle text-center table-bordered">
                    <thead className="table-light">
                      <tr style={{ fontSize: "0.85rem" }}>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Line Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: "0.85rem" }}>
                      {items.map((it) => (
                        <tr key={it.id}>
                          <td>{it.name}</td>
                          <td>₹{Number(it.sellingPrice).toFixed(2)}</td>
                          <td style={{ width: 160 }}>
                            <div className="input-group input-group-sm">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  updateQty(it.id, Math.max(0, it.qty - 1))
                                }
                              >
                                −
                              </button>
                              <input
                                className="form-control text-center"
                                value={it.qty}
                                onChange={(e) =>
                                  updateQty(
                                    it.id,
                                    Math.max(
                                      0,
                                      Math.min(
                                        Number(e.target.value || 0),
                                        it.stock
                                      )
                                    )
                                  )
                                }
                                type="number"
                                min={0}
                                max={it.stock}
                              />
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  updateQty(
                                    it.id,
                                    Math.min(it.stock, it.qty + 1)
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                            <div className="small text-muted">
                              In stock: {it.stock}
                            </div>
                          </td>
                          <td>₹{(it.sellingPrice * it.qty).toFixed(2)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => removeItem(it.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total & Actions */}
                <div className="d-flex justify-content-between align-items-center px-2">
                  <div className="fs-6 fw-semibold">
                    Grand Total:{" "}
                    <span className="text-success">
                      ₹{Number(grandTotal).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <button
                      className="btn btn-outline-secondary me-2"
                      onClick={() => {
                        if (
                          window.confirm("Clear selected products?")
                        ) {
                          items.forEach((it) => removeItem(it.id));
                        }
                      }}
                    >
                      🗑️ Clear
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={onGenerateBill}
                    >
                      ✅ Generate Bill
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-light" onClick={onClose}>
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
