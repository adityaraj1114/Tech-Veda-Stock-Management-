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
    <form onSubmit={handleAddToCart} className="row g-2 mb-3">
      <div className="col-md">
        <input
          type="text"
          className="form-control"
          placeholder="Supplier Name"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          required
        />
      </div>
      <div className="col-md">
        <input
          type="text"
          className="form-control"
          placeholder="Item"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          required
        />
      </div>
      <div className="col-md">
        <input
          type="number"
          className="form-control"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          min="1"
        />
      </div>
      <div className="col-md">
        <input
          type="number"
          className="form-control"
          placeholder="Cost per Unit"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
          min="1"
        />
      </div>
      <div className="col-auto">
        <button type="submit" className="btn btn-primary">
          ➕ Add to Cart
        </button>
      </div>
    </form>
  );
}
