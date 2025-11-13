// src/components/SaleTransactions.jsx
import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function SaleTransactions({ transactions = [], onView, onDelete }) {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");
  const pageSize = 20;

  // ✅ Date parser (handles DD-MM-YYYY, YYYY-MM-DD etc.)
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    let d = new Date(dateStr);
    if (isNaN(d)) {
      const parts = dateStr.split(/[\/\-]/).map(Number);
      if (parts.length === 3) {
        const [day, month, year] = parts[0] > 12 ? parts : [parts[2], parts[1], parts[0]];
        d = new Date(year, month - 1, day);
      }
    }
    return isNaN(d) ? null : d;
  };

  const formatDate = (dateStr) => {
    const d = parseDate(dateStr);
    if (!d) return dateStr || "-";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Month dropdown options
  const monthOptions = useMemo(() => {
    const set = new Set();
    transactions.forEach((tx) => {
      const d = parseDate(tx.date);
      if (d)
        set.add(`${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`);
    });
    return Array.from(set).sort((a, b) => {
      const [am, ay] = a.split("-").map(Number);
      const [bm, by] = b.split("-").map(Number);
      return new Date(by, bm - 1) - new Date(ay, am - 1);
    });
  }, [transactions]);

  // ✅ Filtering + Sorting (Latest first)
  const filtered = useMemo(() => {
    const rawSearch = search.toLowerCase();
    const numericSearch = search.replace(/\D/g, "");

    return (transactions || [])
      .filter((tx) => {
        const customerName = String(tx.customer ?? "").toLowerCase();
        const customerPhone = (tx.customerInfo?.contactPhone || "").replace(/\D/g, "");
        const matchesText =
          !rawSearch ||
          customerName.includes(rawSearch) ||
          (numericSearch && customerPhone.includes(numericSearch)) ||
          tx.items?.some((it) =>
            String(it.product ?? "").toLowerCase().includes(rawSearch)
          );

        const txDate = parseDate(tx.date);
        const matchesStart = !startDate || (txDate && txDate >= new Date(startDate));
        const matchesEnd = !endDate || (txDate && txDate <= new Date(endDate));

        const monthKey = txDate
          ? `${String(txDate.getMonth() + 1).padStart(2, "0")}-${txDate.getFullYear()}`
          : "";

        const matchesMonth = !filterMonth || monthKey === filterMonth;

        return matchesText && matchesStart && matchesEnd && matchesMonth;
      })
      .sort((a, b) => {
        const da = parseDate(a.date);
        const db = parseDate(b.date);
        return db - da; // 🔥 ensures newest first
      });
  }, [transactions, search, startDate, endDate, filterMonth]);

  // ✅ Pagination (after sorting)
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  // ✅ Totals
  const totalSale = filtered.reduce((sum, tx) => sum + (parseFloat(tx.total) || 0), 0);
  const totalPaid = filtered.reduce((sum, tx) => sum + (parseFloat(tx.paid) || 0), 0);
  const totalPending = filtered.reduce(
    (sum, tx) => sum + (parseFloat(tx.pending) || 0),
    0
  );

  // ✅ Month-wise totals
  const monthWiseTotals = useMemo(() => {
    const map = {};
    transactions.forEach((tx) => {
      const d = parseDate(tx.date);
      if (!d) return;
      const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
      if (!map[key]) map[key] = { total: 0, paid: 0, pending: 0, count: 0 };
      map[key].total += parseFloat(tx.total ?? 0);
      map[key].paid += parseFloat(tx.paid ?? 0);
      map[key].pending += parseFloat(tx.pending ?? 0);
      map[key].count += 1;
    });
    return Object.fromEntries(
      Object.entries(map).sort((a, b) => {
        const [am, ay] = a[0].split("-").map(Number);
        const [bm, by] = b[0].split("-").map(Number);
        return new Date(by, bm - 1) - new Date(ay, am - 1);
      })
    );
  }, [transactions]);

  // ✅ Export CSV
  const exportCSV = () => {
    if (!filtered.length) return alert("No transactions to export.");
    const data = filtered.map((tx) => ({
      Date: formatDate(tx.date),
      Customer: tx.customer,
      Mobile: tx.customerInfo?.contactPhone || "—",
      "Total (₹)": tx.total,
      "Paid (₹)": tx.paid,
      "Pending (₹)": tx.pending,
      Items: tx.items
        ?.map((it) => `${it.product} (${it.quantity})`)
        .join(", ") || "—",
    }));
    const csv = Papa.unparse(data);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), "sales.csv");
  };

  // ✅ Export Excel
  const exportExcel = () => {
    if (!filtered.length) return alert("No transactions to export.");
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map((tx) => ({
        Date: formatDate(tx.date),
        Customer: tx.customer,
        Mobile: tx.customerInfo?.contactPhone || "—",
        Total: tx.total,
        Paid: tx.paid,
        Pending: tx.pending,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "sales.xlsx"
    );
  };

  // ✅ Selection logic
  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAllOnPage = () => {
    const ids = paginated.map((tx) => tx.id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected ? prev.filter((id) => !ids.includes(id)) : [...prev, ...ids]
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedIds.length) return alert("No transactions selected.");
    if (window.confirm("Delete selected transactions?")) {
      selectedIds.forEach((id) => onDelete(id));
      setSelectedIds([]);
    }
  };

  const handleDeleteAll = () => {
    if (!filtered.length) return alert("No transactions to delete.");
    if (window.confirm("Delete all filtered transactions?")) {
      filtered.forEach((tx) => onDelete(tx.id));
      setSelectedIds([]);
    }
  };

  return (
    <>
      {/* Filters Header */}
      <div className="row g-2 mb-3 mt-4 text-center">
        <div
          className="col-md"
          style={{
            background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          <h2>📄 Sales Transactions</h2>
        </div>

        <div className="col-md">
          <input
            className="form-control"
            placeholder="🔍 Search by name, product or mobile"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="col-md-auto d-flex align-items-center gap-2">
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="col-md-auto d-flex align-items-center gap-2">
          <select
            className="form-select"
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Months</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <button
            className="btn btn-outline-success"
            onClick={exportCSV}
            disabled={!filtered.length}
          >
            📥 CSV
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={exportExcel}
            disabled={!filtered.length}
          >
            📊 Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="table-responsive mb-2 p-3 rounded fw-semibold text-center"
        style={{ background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)" }}
      >
        <table className="table table-bordered table-hover align-middle bg-light">
          <thead className="table-secondary">
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
              <th>Date & Time</th>
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
                <td colSpan={10} className="text-muted">
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
                  <td>{tx.customer || "—"}</td>
                  <td>{tx.customerInfo?.contactPhone || "—"}</td>
                  <td className="fw-bold text-primary">
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

          <tfoot className="table-secondary fw-bold">
            <tr>
              <td colSpan="5" className="text-end">
                TOTAL:
              </td>
              <td className="text-primary">₹{totalSale.toFixed(2)}</td>
              <td className="text-success">₹{totalPaid.toFixed(2)}</td>
              <td className="text-danger">₹{totalPending.toFixed(2)}</td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </table>

        {/* Pagination */}
        <div className="d-flex justify-content-center gap-4 align-items-center mt-2 pb-4">
          <button
            className="btn btn-outline-light bg-danger text-white"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ⬅️ Previous
          </button>
          <span className="fw-bold text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline-light bg-danger text-white"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next ➡️
          </button>
        </div>
      </div>

      {/* Bulk Delete Buttons */}
      <div className="d-flex gap-2 mb-4">
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

      {/* Month-wise Summary */}
      <div className="table-responsive mb-5">
        <h3 className="text-center text-primary">📊 Month-wise Totals</h3>
        <table className="table table-bordered table-hover text-center">
          <thead className="table-dark">
            <tr>
              <th>Month-Year</th>
              <th>Transactions</th>
              <th>Total (₹)</th>
              <th>Paid (₹)</th>
              <th>Pending (₹)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(monthWiseTotals).length === 0 ? (
              <tr>
                <td colSpan="5" className="text-muted">
                  No data 🚫
                </td>
              </tr>
            ) : (
              Object.entries(monthWiseTotals).map(([month, stats]) => (
                <tr key={month}>
                  <td>{month}</td>
                  <td>{stats.count}</td>
                  <td className="fw-bold text-primary">
                    ₹{stats.total.toFixed(2)}
                  </td>
                  <td className="text-success">₹{stats.paid.toFixed(2)}</td>
                  <td className="text-danger">₹{stats.pending.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
