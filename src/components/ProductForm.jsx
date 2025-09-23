// src/components/ProductForm.jsx
import React, { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";
import Select from "react-select";
import { motion } from "framer-motion";

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

  // Unique product names from purchases (normalized)
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
      .map((w) =>
        w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""
      )
      .join(" ");

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddToCart();
      }}
      className="row g-3 mb-4 card shadow-lg p-4 border-0 m-1"
      style={{
        // background: "linear-gradient(135deg, #f3e5f5, #e3f2fd, #e0f7fa)",
                        background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",

        borderRadius: "20px",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h4 className="fw-bold text-white d-flex align-items-center mb-3">
        🛒 Add Product
      </h4>

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
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "12px",
              borderColor: "#90caf9",
              boxShadow: "none",
              padding: "4px",
            }),
          }}
        />
      </div>

      {/* Quantity */}
      <div className="col-md-3">
        <input
          type="number"
          className="form-control rounded-3"
          placeholder="📦 Quantity"
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
          className="form-control rounded-3"
          placeholder="💲 Unit Price (₹)"
          min="0"
          step="any"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      {/* Add Button */}
      <div className="col-md-2 d-grid">
        <motion.button
          type="submit"
          className="btn btn-success fw-bold rounded-4 shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ➕ Add
        </motion.button>
      </div>
    </motion.form>
  );
}
