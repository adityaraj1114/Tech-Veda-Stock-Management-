import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { usePurchase } from "../context/PurchaseContext";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import PurchaseForm from "../components/PurchaseForm";
import PurchaseCart from "../components/PurchaseCart";
import PurchaseFilters from "../components/PurchaseFilters";
import PurchaseTable from "../components/PurchaseTable";
import PurchaseModal from "../components/PurchaseModal";

export default function Purchases() {
  const {
    purchases,
    purchaseCart,
    addToPurchaseCart,
    completePurchase,
    deletePurchase,
    getTotalPurchaseAmount,
    setPurchaseCart,
    sellingPriceHistory,
  } = usePurchase();

  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [search, setSearch] = useState("");

  // normalize key
  const normalizeKey = (s) => (s || "").toString().trim().toLowerCase();

  // ✅ Auto-fill selling price if exists
  useEffect(() => {
    if (item) {
      const histPrice = sellingPriceHistory?.[normalizeKey(item)];
      if (histPrice !== undefined && histPrice !== null) {
        setSellingPrice(histPrice.toString());
      }
    }
  }, [item, sellingPriceHistory]);

  // ✅ Filter purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) =>
      p.supplier.toLowerCase().includes(search.toLowerCase())
    );
  }, [purchases, search]);

  // ✅ Add to cart
  const handleAddToCart = (newPurchase) => {
    addToPurchaseCart(newPurchase);

    // reset fields (supplier stays!)
    setItem("");
    setQuantity("");
    setBuyingPrice("");
    setSellingPrice("");
  };

  // ✅ Remove from cart
  const handleRemoveItem = (id) => {
    setPurchaseCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ Complete purchase
  const handleCompletePurchase = () => {
    if (!supplier || purchaseCart.length === 0) return;
    completePurchase(supplier);

    // ✅ reset supplier after full purchase
    setSupplier("");
  };

  // ✅ Export CSV
  const exportCSV = () => {
    if (!filteredPurchases.length) return;

    const data = filteredPurchases.map((p) => ({
      Date: p.date,
      Supplier: p.supplier,
      "Total Cost (₹)": p.totalCost.toFixed(2),
      Items: p.items
        .map(
          (it) =>
            `${it.item} (${it.quantity}) @ ₹${it.buyingPrice}` +
            (it.sellingPrice ? ` → SP: ₹${it.sellingPrice}` : "")
        )
        .join(", "),
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `purchases_${Date.now()}.csv`);
  };

  // ✅ Export Excel
  const exportExcel = () => {
    if (!filteredPurchases.length) return;

    const data = filteredPurchases.map((p) => ({
      Date: p.date,
      Supplier: p.supplier,
      "Total Cost (₹)": p.totalCost.toFixed(2),
      Items: p.items
        .map(
          (it) =>
            `${it.item} (${it.quantity}) @ ₹${it.buyingPrice}` +
            (it.sellingPrice ? ` → SP: ₹${it.sellingPrice}` : "")
        )
        .join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `purchases_${Date.now()}.xlsx`);
  };

  return (
    <div className="container mt-4 mb-5 pb-5">
      {/* Page Heading */}
      <motion.h2
        className="mb-4 fw-bold text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(90deg, #ff6a00, #ee0979)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "1.6rem",
        }}
      >
        📦 Purchase Management
      </motion.h2>

      {/* Total Purchase Summary */}
      <motion.div
        className="p-3 mb-4 rounded-4 shadow-sm text-center"
        style={{
          background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <strong className="fs-5 text-white pt-2 pb-2 m-2">
          💰 Total Purchased:{" "}
        </strong>
        <span className="fs-4 fw-bold text-white ms-2 bg-success bg-opacity-10 p-2 rounded-3">
          ₹{getTotalPurchaseAmount().toFixed(2)}
        </span>
      </motion.div>

      {/* Purchase Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PurchaseForm
          supplier={supplier}
          setSupplier={setSupplier}
          item={item}
          setItem={setItem}
          quantity={quantity}
          setQuantity={setQuantity}
          buyingPrice={buyingPrice}
          setBuyingPrice={setBuyingPrice}
          sellingPrice={sellingPrice}
          setSellingPrice={setSellingPrice}
          handleAddToCart={handleAddToCart}
        />
      </motion.div>

      {/* Purchase Cart */}
      <PurchaseCart
        purchaseCart={purchaseCart}
        handleCompletePurchase={handleCompletePurchase}
        handleRemoveItem={handleRemoveItem}
        clearCart={() => setPurchaseCart([])}
      />

      

      {/* Search + Export */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <PurchaseFilters
          search={search}
          setSearch={setSearch}
          exportCSV={exportCSV}
          exportExcel={exportExcel}
          disabled={!filteredPurchases.length}
        />
      </motion.div>

      {/* Purchase Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <PurchaseTable
          purchases={filteredPurchases}
          onView={setSelectedPurchase}
          onDelete={deletePurchase}
        />
      </motion.div>

      {/* View Modal */}
      <PurchaseModal
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />
    </div>
  );
}
