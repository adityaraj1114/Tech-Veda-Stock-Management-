// src/components/ProductForm.jsx
import React, { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";

export default function ProductForm({
  product,
  setProduct,
  quantity,
  setQuantity,
  price,
  setPrice,
  handleAddToCart,
}) {
  const { purchases } = useContext(InventoryContext);
  const uniqueProducts = [
    ...new Set(purchases.map((p) => p.item.trim().toLowerCase())),
  ];
  const formatProduct = (prod) =>
    prod
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  return (
    <form onSubmit={handleAddToCart} className="row g-2 mb-4">
      <div className="col-md">
        <select
          className="form-control"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          required
        >
          <option value="">-- Select Product --</option>
          {uniqueProducts.map((p, i) => (
            <option key={i} value={formatProduct(p)}>
              {formatProduct(p)}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md">
        <input
          type="number"
          className="form-control"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>
      <div className="col-md">
        <input
          type="number"
          className="form-control"
          placeholder="Unit Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      <div className="col-auto">
        <button type="submit" className="btn btn-warning px-4">
          ➕ Add to Cart
        </button>
      </div>
    </form>
  );
}
