// src/components/PurchaseFilters.jsx
import React from "react";

export default function PurchaseFilters({
  search = "",
  setSearch,
  exportCSV,
  exportExcel,
  disabled = false,
}) {
  return (
    <div className="row g-2 mb-3 align-items-center">
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
