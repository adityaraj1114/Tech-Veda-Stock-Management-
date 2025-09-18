// src/components/ProductForm.jsx
import React, { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";
import Select from "react-select"; // ✅ searchable dropdown

export default function ProductForm({
  product,
  setProduct,
  quantity,
  productOptions,
  setQuantity,
  price,
  setPrice,
  handleAddToCart,
}) {
  const { purchases } = useContext(InventoryContext);

  // Unique product names from purchases
  const uniqueProducts = [
    ...new Set(
      purchases
        .map((p) => (p.item ? p.item.trim().toLowerCase() : ""))
        .filter(Boolean)
    ),
  ];

  // Format product name for display
  const formatProduct = (prod) =>
    prod
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
      .join(" ");

  return (
    <>
    <form
      onSubmit={(e) => {
        e.preventDefault(); // ✅ prevent refresh
        handleAddToCart(); // ✅ call without passing event
      }}
      className="row g-2 mb-3 card p-3 shadow-sm"
    >
      <h5>🛒 Add Product</h5>

      {/* Product Select */}
      <div className="col-md-4">
        <Select
          options={productOptions}
          value={product}
          onChange={(opt) => {
            setProduct(opt);
            if (opt?.price) setPrice(opt.price); // Autofill price if available
          }}
          placeholder="🔍 Select product..."
          isClearable
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* Quantity */}
      <div className="col-md-3">
        <input
          type="number"
          className="form-control"
          placeholder="Quantity"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      {/* Price */}
      <div className="col-md-3">
        <input
          type="number"
          className="form-control"
          placeholder="Unit Price (₹)"
          min="0"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      {/* Add Button */}
      <div className="col-md-2 d-grid">
        <button type="submit" className="btn btn-primary">
          ➕ Add
        </button>
      </div>
    </form>
    </>
  );
}
