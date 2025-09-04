// src/components/ProductForm.jsx
import React, { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";
import Select from "react-select"; // ✅ searchable select

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

  // Ensure safe mapping (avoid .trim() on undefined)
  const uniqueProducts = [
    ...new Set(
      purchases
        .map((p) => (p.item ? p.item.trim().toLowerCase() : ""))
        .filter(Boolean)
    ),
  ];

  const formatProduct = (prod) =>
    prod
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
      .join(" ");

  return (
    <>
      <form onSubmit={handleAddToCart} className="row g-2 mb-3">
        <div className="col-md-4">
          <Select
            options={productOptions}
            value={product}
            onChange={(opt) => {
              setProduct(opt);
              if (opt?.price) setPrice(opt.price);
            }}
            placeholder="🔍 Select product..."
            isClearable
          />
        </div>
        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Unit Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">
            ➕ Add
          </button>
        </div>
      </form>
    </>
  );
}
