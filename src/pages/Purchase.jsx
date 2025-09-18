import React, { useState, useMemo } from "react";
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
  } = usePurchase();

  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [search, setSearch] = useState("");

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) =>
      p.supplier.toLowerCase().includes(search.toLowerCase())
    );
  }, [purchases, search]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!supplier || !item || !quantity || !cost) return;

    addToPurchaseCart({
      item,
      quantity: parseInt(quantity, 10),
      cost: parseFloat(cost),
    });

    setItem("");
    setQuantity("");
    setCost("");
  };

  const handleCompletePurchase = () => {
    if (!supplier || purchaseCart.length === 0) return;
    completePurchase(supplier);
    setSupplier("");
  };

  const exportCSV = () => {
    if (!filteredPurchases.length) return;

    const data = filteredPurchases.map((p) => ({
      Date: p.date,
      Supplier: p.supplier,
      "Total Cost (₹)": p.totalCost.toFixed(2),
      Items: p.items.map((it) => `${it.item} (${it.quantity})`).join(", "),
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `purchases_${Date.now()}.csv`);
  };

  const exportExcel = () => {
    if (!filteredPurchases.length) return;

    const data = filteredPurchases.map((p) => ({
      Date: p.date,
      Supplier: p.supplier,
      "Total Cost (₹)": p.totalCost.toFixed(2),
      Items: p.items.map((it) => `${it.item} (${it.quantity})`).join(", "),
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
    <div className="container mt-4">
      <h2 className="mb-4">📦 Purchase Management</h2>

      {/* ✅ Total Purchase Summary Box */}
      <div className="alert alert-info d-flex justify-content-between align-items-center shadow-sm">
        <strong>💰 Total Purchased:</strong>
        <span className="fs-5 fw-bold text-success">
          ₹{getTotalPurchaseAmount().toFixed(2)}
        </span>
      </div>

      {/* ✅ Purchase Form */}
      <PurchaseForm
        supplier={supplier}
        setSupplier={setSupplier}
        item={item}
        setItem={setItem}
        quantity={quantity}
        setQuantity={setQuantity}
        cost={cost}
        setCost={setCost}
        handleAddToCart={handleAddToCart}
      />

      {/* ✅ Cart Table */}
      {purchaseCart.length > 0 && (
        <PurchaseCart
          purchaseCart={purchaseCart}
          handleCompletePurchase={handleCompletePurchase}
        />
      )}

      <h3 className="mb-3 mt-5">📑 Purchase Transactions</h3>

      {/* ✅ Search + Export */}
      <PurchaseFilters
        search={search}
        setSearch={setSearch}
        exportCSV={exportCSV}
        exportExcel={exportExcel}
        disabled={!filteredPurchases.length}
      />

      {/* ✅ Purchase Table */}
      <PurchaseTable
        purchases={filteredPurchases}
        onView={setSelectedPurchase}
        onDelete={deletePurchase}
      />

      {/* ✅ View Modal */}
      <PurchaseModal
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />
    </div>
  );
}
