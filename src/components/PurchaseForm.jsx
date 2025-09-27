// src/components/PurchaseForm.jsx
import React from "react";

export default function PurchaseForm({
  supplier,
  setSupplier,
  item,
  setItem,
  quantity,
  setQuantity,
  buyingPrice,
  setBuyingPrice,
  sellingPrice,
  setSellingPrice,
  handleAddToCart,
}) {
  const onSubmit = (e) => {
    e.preventDefault();

    const qty = Number(quantity) || 0;
    const bp = Number(buyingPrice) || 0;
    const sp = sellingPrice ? Number(sellingPrice) : null;

    const newPurchase = {
      id: Date.now(),
      supplier: supplier.trim(),
      item: item.trim(),
      quantity: qty,
      buyingPrice: bp,
      sellingPrice: sp,
      totalCost: qty * bp,
    };

    handleAddToCart(newPurchase);

    // ✅ reset only product fields (supplier will remain same)
    setItem("");
    setQuantity("");
    setBuyingPrice("");
    setSellingPrice("");
  };

  return (
    <form
      onSubmit={onSubmit}
      className="p-4 mb-4 rounded-4 shadow-lg"
      style={{
        background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
        color: "#fff",
      }}
    >
      <h5 className="mb-4 fw-bold">🛒 Add Purchase Item</h5>
      <div className="row g-3 align-items-center">
        {/* Supplier */}
        <div className="col-md-2">
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
        <div className="col-md-2">
          <input
            type="text"
            className="form-control form-control-lg rounded-pill"
            placeholder="Item Name"
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

        {/* Buying Price per Unit */}
        <div className="col-md-2">
          <input
            type="number"
            step="0.01"
            className="form-control form-control-lg rounded-pill"
            placeholder="Buying Price per Unit (₹)"
            value={buyingPrice}
            onChange={(e) => setBuyingPrice(e.target.value)}
            required
            min="0.01"
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              border: "none",
              color: "#000",
            }}
          />
        </div>

        {/* Selling Price (Optional) */}
        <div className="col-md-2">
          <input
            type="number"
            step="0.01"
            className="form-control form-control-lg rounded-pill"
            placeholder="Selling Price (₹) - Optional"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            min="0"
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
