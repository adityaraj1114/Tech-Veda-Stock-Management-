// src/components/ProductForm.jsx
import React, { useEffect } from "react";
import { usePurchase } from "../context/PurchaseContext";
import { useProfile } from "../context/ProfileContext";
import Select from "react-select";
import { motion } from "framer-motion";

export default function ProductForm({
  product,
  setProduct,
  quantity,
  setQuantity,
  price,
  setPrice,
  discount,
  setDiscount,
  gst,
  setGst,
  productOptions,
  handleAddToCart,
}) {
  const { lastSellingPrices } = usePurchase(); // stores last selling price per product
  const { profile } = useProfile();

  // ------------------- Auto-fill selling price -------------------
  useEffect(() => {
    if (!product) return;

    const productName =
      product?.value ?? product?.label ?? product?.toString?.();

    // 1️⃣ If last selling price exists in PurchaseContext
    if (productName && lastSellingPrices[productName] !== undefined) {
      setPrice(lastSellingPrices[productName].toString());
    } 
    // 2️⃣ Fallback: check inside product object itself
    else if (
      product?.sellingPrice !== undefined ||
      product?.price !== undefined ||
      product?.unitPrice !== undefined
    ) {
      const optPrice =
        product.sellingPrice ?? product.price ?? product.unitPrice;
      setPrice(optPrice?.toString() ?? "");
    } 
    // 3️⃣ No price → clear field
    else {
      setPrice("");
    }
  }, [product, lastSellingPrices, setPrice]);

  // ------------------- Auto-fill GST from profile -------------------
  useEffect(() => {
    if (!gst || gst === "") {
      setGst(profile?.gstPercent?.toString() ?? "0");
    }
  }, [profile, gst, setGst]);

  // ------------------- Render Form -------------------
  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        handleAddToCart();
      }}
      className="row g-3 mb-4 card shadow-lg p-4 border-0 m-1"
      style={{
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
      <div className="col-md-3">
        <Select
          options={productOptions}
          value={product}
          onChange={(opt) => setProduct(opt)}
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
      <div className="col-md-2">
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

      {/* Selling Price (auto-fill & editable) */}
      <div className="col-md-2">
        <input
          type="number"
          className="form-control rounded-3"
          placeholder="💲 Selling Price (₹)"
          min="0"
          step="any"
          value={price ?? ""}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      {/* Discount */}
      <div className="col-md-2">
        <input
          type="number"
          className="form-control rounded-3"
          placeholder="🏷 Discount %"
          min="0"
          step="any"
          value={discount ?? ""}
          onChange={(e) => setDiscount(e.target.value)}
        />
      </div>

      {/* GST */}
      <div className="col-md-1">
        <input
          type="number"
          className="form-control rounded-3"
          placeholder="GST %"
          min="0"
          step="any"
          value={gst ?? ""}
          onChange={(e) => setGst(e.target.value)}
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
