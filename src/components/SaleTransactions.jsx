// src/components/SaleTransactions.jsx
import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function SaleTransactions({ transactions, onView, onDelete }) {
  const [search, setSearch] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const pageSize = 20;

  const filtered = useMemo(() => {
    return (transactions || [])
      .filter((tx) => {
        const customerName = (tx.customer || "").toLowerCase();
        const customerPhone = (tx.customerInfo?.contactPhone || "").replace(
          /\D/g,
          ""
        );
        const searchText = search.toLowerCase().replace(/\D/g, "");

        const matchesText =
          customerName.includes(search.toLowerCase()) ||
          customerPhone.includes(searchText) ||
          tx.items?.some((it) =>
            (it.product || "").toLowerCase().includes(search.toLowerCase())
          );

        const amt = parseFloat(tx.total ?? 0);
        const aboveMin = minAmt === "" || amt >= parseFloat(minAmt);
        const belowMax = maxAmt === "" || amt <= parseFloat(maxAmt);

        return matchesText && aboveMin && belowMax;
      })
      .sort((a, b) => {
        const da = Date.parse(a.date) || a.id || 0;
        const db = Date.parse(b.date) || b.id || 0;
        return db - da;
      });
  }, [transactions, search, minAmt, maxAmt]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportCSV = () => {
    if (!filtered.length) return;

    const data = filtered.map((tx) => ({
      Date: formatDate(tx.date),
      Customer: tx.customer,
      Mobile: tx.customerInfo?.contactPhone || "—",
      "Total (₹)": parseFloat(tx.total ?? 0).toFixed(2),
      "Paid (₹)": parseFloat(tx.paid ?? 0).toFixed(2),
      "Pending (₹)": parseFloat(tx.pending ?? 0).toFixed(2),
      Items: tx.items?.map((it) => `${it.product} (${it.quantity})`).join(", "),
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `transactions_${Date.now()}.csv`);
  };

  const exportExcel = () => {
    if (!filtered.length) return;

    const data = filtered.map((tx) => ({
      Date: formatDate(tx.date),
      Customer: tx.customer,
      Mobile: tx.customerInfo?.contactPhone || "—",
      "Total (₹)": parseFloat(tx.total ?? 0).toFixed(2),
      "Paid (₹)": parseFloat(tx.paid ?? 0).toFixed(2),
      "Pending (₹)": parseFloat(tx.pending ?? 0).toFixed(2),
      Items: tx.items?.map((it) => `${it.product} (${it.quantity})`).join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `transactions_${Date.now()}.xlsx`);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllOnPage = () => {
    const idsOnPage = paginated.map((tx) => tx.id);
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
    if (!filtered.length) return;
    if (!window.confirm("Delete all filtered transactions?")) return;
    filtered.forEach((tx) => onDelete(tx.id));
    setSelectedIds([]);
  };

  return (
    <>
      {/* 🔍 Search + Filter */}
      <div className="row g-2 mb-3 mt-5">
        <div className="col-md">
          <input
            className="form-control"
            placeholder="🔍 Search by name or mobile"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Min Amount"
            value={minAmt}
            onChange={(e) => {
              setMinAmt(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Max Amount"
            value={maxAmt}
            onChange={(e) => {
              setMaxAmt(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-md-auto d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-success"
            onClick={exportCSV}
            disabled={!filtered.length}
          >
            📥 Export CSV
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={exportExcel}
            disabled={!filtered.length}
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* 📄 Transactions Table */}
      <div className="table-responsive mb-3">
        <h5>📄 Transactions</h5>
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={selectAllOnPage}
                  checked={
                    paginated.length > 0 &&
                    paginated.every((tx) => selectedIds.includes(tx.id))
                  }
                />
              </th>
              <th>No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Total (₹)</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>View</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-muted">
                  No transactions found 🚫
                </td>
              </tr>
            ) : (
              paginated.map((tx, i) => (
                <tr key={tx.id || i}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(tx.id)}
                      onChange={() => toggleSelect(tx.id)}
                    />
                  </td>
                  <td>{(currentPage - 1) * pageSize + i + 1}</td>
                  <td>{formatDate(tx.date)}</td>
                  <td>{tx.customer}</td>
                  <td>{tx.customerInfo?.contactPhone || "—"}</td>
                  <td className="fw-bold">
                    ₹{parseFloat(tx.total ?? 0).toFixed(2)}
                  </td>
                  <td className="text-success">
                    ₹{parseFloat(tx.paid ?? 0).toFixed(2)}
                  </td>
                  <td className="text-danger">
                    ₹{parseFloat(tx.pending ?? 0).toFixed(2)}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => onView(tx.id)}
                    >
                      👁️
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => onDelete(tx.id)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📌 Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            className="btn btn-outline-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ⬅️ Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next ➡️
          </button>
        </div>
      )}
      <hr></hr>
      <div className="d-flex gap-2 mb-5">
        <button
            className="btn btn-outline-danger"
            onClick={handleDeleteSelected}
            disabled={!selectedIds.length}
          >
            🗑 Delete Selected
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDeleteAll}
            disabled={!filtered.length}
          >
            🧹 Delete All
          </button>
      </div>
    </>
  );
}
