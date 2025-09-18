// src/components/PurchaseFilters.jsx
import React from "react";

export default function PurchaseFilters({ search, setSearch, exportCSV, exportExcel, disabled }) {
  return (
    <div className="row g-2 mb-3">
      <div className="col-md">
        <input
          className="form-control"
          placeholder="🔍 Search by supplier"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="col-md-auto d-flex align-items-center gap-2">
        <button className="btn btn-outline-success" onClick={exportCSV} disabled={disabled}>
          📥 Export CSV
        </button>
        <button className="btn btn-outline-primary" onClick={exportExcel} disabled={disabled}>
          📊 Export Excel
        </button>
      </div>
    </div>
  );
}
