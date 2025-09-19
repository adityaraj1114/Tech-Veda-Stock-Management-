import React, { useState, useMemo } from "react";

export default function PurchaseTable({ purchases, onView, onDelete }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const totalPages = Math.ceil(purchases.length / pageSize);
  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return purchases
      .slice()
      .reverse()
      .slice(start, start + pageSize);
  }, [purchases, currentPage]);

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
    <div className="table-responsive mt-4">
      <table className="table table-bordered table-hover align-middle">
        <thead className="table-light">
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
              <tr key={p.id}>
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
                    className="btn btn-sm btn-info"
                    onClick={() => onView(p)}
                  >
                    👁
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
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
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
        <button
          className="btn btn-sm btn-outline-secondary ms-2"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ⬅️ Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          className="btn btn-sm btn-outline-secondary ms-1"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          ➡️ Next
        </button>
      </div>

      {/* Bulk Actions */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-danger me-2"
            onClick={handleDeleteSelected}
            disabled={!selectedIds.length}
          >
            🗑 Delete Selected
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={handleDeleteAll}
            disabled={!purchases.length}
          >
            🧹 Delete All
          </button>
        </div>
      </div>
    </div>
  );
}
