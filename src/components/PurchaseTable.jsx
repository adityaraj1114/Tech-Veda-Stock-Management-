// src/components/PurchaseTable.jsx
import React, { useState, useMemo } from "react";

export default function PurchaseTable({ purchases, onView, onDelete }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const totalPages = Math.ceil(purchases.length / pageSize) || 1;

  // ✅ Normalize purchases: recalc totalCost properly
  const normalizedPurchases = purchases.map((p) => {
    const total = Array.isArray(p.items)
      ? p.items.reduce(
          (sum, it) =>
            sum +
            (parseFloat(it.buyingPrice) || 0) * (parseFloat(it.quantity) || 0),
          0
        )
      : parseFloat(p.totalCost) || 0;

    return { ...p, totalCost: total };
  });

  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return normalizedPurchases
      .slice()
      .reverse()
      .slice(start, start + pageSize);
  }, [normalizedPurchases, currentPage]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllOnPage = () => {
    const idsOnPage = paginatedPurchases.map((p) => p.id);
    const allSelected = idsOnPage.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !idsOnPage.includes(id))
        : [...prev, ...idsOnPage]
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedIds.length) return alert("No transactions selected.");
    if (!window.confirm("Delete selected transactions?")) return;
    selectedIds.forEach((id) => onDelete(id));
    setSelectedIds([]);
  };

  const handleDeleteAll = () => {
    if (!purchases.length) return;
    if (!window.confirm("Delete all filtered transactions?")) return;
    purchases.forEach((p) => onDelete(p.id));
    setSelectedIds([]);
  };

  return (
    <div className="table-responsive mt-2 px-2 py-5 shadow-sm rounded-4"
    initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          background: "linear-gradient(90deg, #00c6ff, #0072ff)",
        }}
    >
      <table className="table align-middle table-hover table-bordered shadow-sm rounded-3 mb-4">
        <thead
          style={{
            background: "linear-gradient(135deg, #6a11cb, #2575fc)",
            color: "#fff",
          }}
        >
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={selectAllOnPage}
                checked={
                  paginatedPurchases.length > 0 &&
                  paginatedPurchases.every((p) => selectedIds.includes(p.id))
                }
              />
            </th>
            <th>No.</th>
            <th>Date</th>
            <th>Supplier</th>
            <th>Total Cost (₹)</th>
            <th>View</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {paginatedPurchases.length > 0 ? (
            paginatedPurchases.map((p, i) => (
              <tr key={p.id} className="table-light">
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                  />
                </td>
                <td>{(currentPage - 1) * pageSize + i + 1}</td>
                <td>{p.date}</td>
                <td>{p.supplier}</td>
                <td className="fw-bold text-danger">
                  ₹{parseFloat(p.totalCost).toFixed(2)}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-info fw-bold"
                    style={{
                      background: "linear-gradient(45deg, #17ead9, #6078ea)",
                      border: "none",
                      color: "#fff",
                    }}
                    onClick={() => onView(p)}
                  >
                    👁
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-danger fw-bold"
                    style={{
                      background: "linear-gradient(45deg, #ff416c, #ff4b2b)",
                      border: "none",
                      color: "#fff",
                    }}
                    onClick={() => onDelete(p.id)}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No purchases found 🚫
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
        <button
          className="btn btn-sm btn-outline-secondary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ⬅️ Previous
        </button>
        <span className="fw-bold">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-sm btn-outline-secondary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          ➡️ Next
        </button>
      </div>

      {/* Bulk Actions */}
      <div className="d-flex justify-content-start gap-2 mb-4">
        <button
          className="btn btn-sm fw-bold"
          style={{
            background: "linear-gradient(45deg, #ff416c, #ff4b2b)",
            color: "#fff",
            border: "none",
          }}
          onClick={handleDeleteSelected}
          disabled={!selectedIds.length}
        >
          🗑 Delete Selected
        </button>
        <button
          className="btn btn-sm btn-outline-danger fw-bold"
          onClick={handleDeleteAll}
          disabled={!purchases.length}
        >
          🧹 Delete All
        </button>
      </div>
    </div>
  );
}
