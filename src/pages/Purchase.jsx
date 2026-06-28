import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePurchase } from "../context/PurchaseContext";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import PurchaseForm from "../components/PurchaseForm";
import PurchaseCart from "../components/PurchaseCart";
import PurchaseFilters from "../components/PurchaseFilters";
import PurchaseTable from "../components/PurchaseTable";
import PurchaseModal from "../components/PurchaseModal";

// ─── Expense Categories ───────────────────────────────────────────────────────
const EXPENSE_CATEGORIES = [
  "Travelling",
  "Fuel / Oil",
  "Staff Salary",
  "Food & Tea",
  "Electricity",
  "Rent",
  "Loading / Unloading",
  "Repair & Maintenance",
  "Miscellaneous",
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
const loadExpenses = () => {
  try {
    const raw = localStorage.getItem("purchase_expenses");
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const saveExpenses = (data) =>
  localStorage.setItem("purchase_expenses", JSON.stringify(data));

// ─── Add Expense Modal ────────────────────────────────────────────────────────
function AddExpenseModal({ onClose, onAdd }) {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }
    onAdd({
      id: Date.now().toString(),
      category,
      description: description.trim(),
      amount: amt,
      date,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1055,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ duration: 0.25 }}
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "20px",
          padding: "28px 28px 20px",
          width: "100%",
          maxWidth: "480px",
          color: "#fff",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0" style={{ fontSize: "1.1rem" }}>
            💸 Add New Expense
          </h5>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              color: "#fff",
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            className="alert alert-danger py-2 mb-3"
            style={{ fontSize: "13px" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="mb-3">
            <label
              className="form-label fw-semibold"
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}
            >
              Category
            </label>
            <select
              className="form-select rounded-pill"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
              }}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ color: "#000" }}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-3">
            <label
              className="form-label fw-semibold"
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}
            >
              Description
            </label>
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="e.g. Petrol for delivery van"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              required
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
              }}
            />
          </div>

          {/* Amount */}
          <div className="mb-3">
            <label
              className="form-label fw-semibold"
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}
            >
              Amount (₹)
            </label>
            <input
              type="number"
              className="form-control rounded-pill"
              placeholder="Enter amount"
              value={amount}
              min="0.01"
              step="0.01"
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              required
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
              }}
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label
              className="form-label fw-semibold"
              style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}
            >
              Date
            </label>
            <input
              type="date"
              className="form-control rounded-pill"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
              }}
            />
          </div>

          {/* Buttons */}
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn rounded-pill fw-semibold flex-fill"
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn rounded-pill fw-bold flex-fill"
              style={{
                background: "linear-gradient(45deg, #f7971e, #ffd200)",
                border: "none",
                color: "#000",
              }}
            >
              ✅ Save Expense
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Expense Transactions Table ───────────────────────────────────────────────
function ExpenseTransactions({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div
        className="text-center py-4 rounded-4"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px dashed rgba(255,255,255,0.2)",
          color: "rgba(255,255,255,0.6)",
          fontSize: "14px",
        }}
      >
        No expenses recorded yet. Click <strong>+ Add Expense</strong> to start.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: "13px",
            }}
          >
            <th className="text-white" style={{ width: 40 }}>
              #
            </th>
            <th className="text-white">Date</th>
            <th className="text-white">Category</th>
            <th className="text-white">Description</th>
            <th className="text-white text-end">Amount (₹)</th>
            <th className="text-white text-center">Delete</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {expenses.map((exp, i) => (
              <motion.tr
                key={exp.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  background:
                    i % 2 === 0
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(255,255,255,0.02)",
                  color: "#fff",
                  fontSize: "13px",
                }}
              >
                <td className="text-white opacity-75">{i + 1}</td>
                <td className="text-white">{exp.date}</td>
                <td>
                  <span
                    className="badge rounded-pill"
                    style={{
                      background: "rgba(255,214,0,0.2)",
                      color: "#ffd200",
                      border: "1px solid rgba(255,214,0,0.3)",
                      fontSize: "11px",
                    }}
                  >
                    {exp.category}
                  </span>
                </td>
                <td className="text-white">{exp.description}</td>
                <td className="text-end fw-bold" style={{ color: "#ff6b6b" }}>
                  ₹{parseFloat(exp.amount).toFixed(2)}
                </td>
                <td className="text-center">
                  <motion.button
                    className="btn btn-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(exp.id)}
                    style={{
                      background: "rgba(255,65,108,0.2)",
                      border: "1px solid rgba(255,65,108,0.4)",
                      color: "#ff416c",
                      borderRadius: "8px",
                      padding: "2px 10px",
                      fontSize: "13px",
                    }}
                  >
                    ❌
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
        <tfoot>
          <tr
            style={{
              background: "rgba(255,107,107,0.15)",
              borderTop: "2px solid rgba(255,107,107,0.4)",
            }}
          >
            <td
              colSpan={4}
              className="fw-bold text-end"
              style={{ color: "#ff6b6b", fontSize: "14px" }}
            >
              TOTAL EXPENSES:
            </td>
            <td
              className="fw-bold text-end"
              style={{ color: "#ff6b6b", fontSize: "15px" }}
            >
              ₹
              {expenses
                .reduce((s, e) => s + parseFloat(e.amount || 0), 0)
                .toFixed(2)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Main Purchase Page ───────────────────────────────────────────────────────
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

  // Purchase form state
  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [search, setSearch] = useState("");

  // Expense state
  const [expenses, setExpenses] = useState(loadExpenses);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Persist expenses
  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0),
    [expenses]
  );

  const handleAddExpense = (exp) => {
    setExpenses((prev) => [exp, ...prev]);
  };

  const handleDeleteExpense = (id) => {
    if (!window.confirm("Delete this expense?")) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // normalize key
  const normalizeKey = (s) => (s || "").toString().trim().toLowerCase();

  // Auto-fill selling price
  useEffect(() => {
    if (item) {
      const histPrice = sellingPriceHistory?.[normalizeKey(item)];
      if (histPrice !== undefined && histPrice !== null) {
        setSellingPrice(histPrice.toString());
      }
    }
  }, [item, sellingPriceHistory]);

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) =>
      p.supplier.toLowerCase().includes(search.toLowerCase())
    );
  }, [purchases, search]);

  // Add to cart
  const handleAddToCart = (newPurchase) => {
    addToPurchaseCart(newPurchase);
    setItem("");
    setQuantity("");
    setBuyingPrice("");
    setSellingPrice("");
  };

  // Remove from cart
  const handleRemoveItem = (id) => {
    setPurchaseCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Complete purchase
  const handleCompletePurchase = () => {
    if (!supplier || purchaseCart.length === 0) return;
    completePurchase(supplier);
    setSupplier("");
  };

  // Export CSV
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

  // Export Excel
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

      {/* ── Summary Cards Row ─────────────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {/* Total Purchased Card */}
        <div className="col-md-6">
          <motion.div
            className="p-3 rounded-4 shadow-sm text-center h-100 d-flex flex-column justify-content-center"
            style={{
              background:
                "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p
              className="mb-1 text-white fw-semibold"
              style={{ fontSize: "13px", opacity: 0.85 }}
            >
              💰 Total Purchased
            </p>
            <p className="mb-0 fw-bold text-white" style={{ fontSize: "1.6rem" }}>
              ₹{getTotalPurchaseAmount().toFixed(2)}
            </p>
          </motion.div>
        </div>

        {/* Total Expenses Card */}
        <div className="col-md-6">
          <motion.div
            className="p-3 rounded-4 shadow-sm text-center h-100 d-flex flex-column justify-content-center"
            style={{
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #e44d26 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              position: "relative",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p
              className="mb-1 text-white fw-semibold"
              style={{ fontSize: "13px", opacity: 0.85 }}
            >
              💸 Total Expenses
            </p>
            <p className="mb-2 fw-bold text-white" style={{ fontSize: "1.6rem" }}>
              ₹{totalExpenses.toFixed(2)}
            </p>
            <motion.button
              onClick={() => setShowExpenseModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "linear-gradient(45deg, #f7971e, #ffd200)",
                border: "none",
                borderRadius: "30px",
                padding: "6px 20px",
                fontWeight: 700,
                color: "#000",
                fontSize: "13px",
                cursor: "pointer",
                alignSelf: "center",
              }}
            >
              + Add Expense
            </motion.button>
          </motion.div>
        </div>
      </div>

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

      {/* ── Expense Transactions Section ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-5"
      >
        {/* Section Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3
            className="fw-bold mb-0"
            style={{
              background: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "1.35rem",
            }}
          >
            💸 Expense Transactions
          </h3>
          <motion.button
            onClick={() => setShowExpenseModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn fw-bold rounded-pill"
            style={{
              background: "linear-gradient(45deg, #f7971e, #ffd200)",
              border: "none",
              color: "#000",
              fontSize: "13px",
              padding: "6px 18px",
            }}
          >
            + Add Expense
          </motion.button>
        </div>

        {/* Expense Table */}
        <div
          className="rounded-4 shadow-sm p-3"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <ExpenseTransactions
            expenses={expenses}
            onDelete={handleDeleteExpense}
          />
        </div>
      </motion.div>

      {/* View Purchase Modal */}
      <PurchaseModal
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showExpenseModal && (
          <AddExpenseModal
            onClose={() => setShowExpenseModal(false)}
            onAdd={handleAddExpense}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
