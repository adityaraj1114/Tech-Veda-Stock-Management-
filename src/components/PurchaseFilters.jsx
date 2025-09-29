// src/components/PurchaseFilters.jsx
import React from "react";
import { motion } from "framer-motion";


export default function PurchaseFilters({
  search = "",
  setSearch,
  exportCSV,
  exportExcel,
  disabled = false,
}) {
  return (
    <div className="row g-2 mb-3 align-items-center">

      {/* Section Heading */}
            <motion.h3
              className="mb-3 mt-5 fw-semibold text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📑 Purchase Transactions
            </motion.h3>


      {/* Search Input */}
      <div className="col-md mt-3">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search by supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Export Buttons */}
      <div className="col-md-auto d-flex gap-2 mb-3">
        <button
          className="btn btn-outline-success fw-bold"
          onClick={exportCSV}
          disabled={disabled}
        >
          📥 Export CSV
        </button>
        <button
          className="btn btn-outline-primary fw-bold"
          onClick={exportExcel}
          disabled={disabled}
        >
          📊 Export Excel
        </button>
      </div>
    </div>
  );
}
