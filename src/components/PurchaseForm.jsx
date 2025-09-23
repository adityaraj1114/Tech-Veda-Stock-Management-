// src/components/PurchaseForm.jsx
import React from "react";

export default function PurchaseForm({
  supplier,
  setSupplier,
  item,
  setItem,
  quantity,
  setQuantity,
  cost,
  setCost,
  handleAddToCart,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // prevent page reload
        handleAddToCart();
      }}
      className="p-4 mb-4 rounded-4 shadow-lg"
      style={{
        // background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
        background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
        color: "#fff",
      }}
    >
      <h5 className="mb-4 fw-bold">🛒 Add Purchase Item</h5>
      <div className="row g-3 align-items-center">

        {/* Supplier */}
        <div className="col-md-3">
          <input
            type="text"
            className="form-control form-control-lg rounded-pill"
            placeholder="Supplier Name"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            required
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "none",
              color: "#000",
            }}
          />
        </div>

        {/* Item */}
        <div className="col-md-3">
          <input
            type="text"
            className="form-control form-control-lg rounded-pill"
            placeholder="Item"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            required
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "none",
              color: "#000",
            }}
          />
        </div>

        {/* Quantity */}
        <div className="col-md-2">
          <input
            type="number"
            className="form-control form-control-lg rounded-pill"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="1"
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "none",
              color: "#000",
            }}
          />
        </div>

        {/* Cost */}
        <div className="col-md-2">
          <input
            type="number"
            step="0.01"
            className="form-control form-control-lg rounded-pill"
            placeholder="Cost per Unit (₹)"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            min="0.01"
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "none",
              color: "#000",
            }}
          />
        </div>

        {/* Add Button */}
        <div className="col-md-2 d-grid">
          <button
            type="submit"
            className="btn btn-gradient btn-lg rounded-pill fw-bold"
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
            ➕ Add to Cart
          </button>
        </div>
      </div>
    </form>
  );
}
