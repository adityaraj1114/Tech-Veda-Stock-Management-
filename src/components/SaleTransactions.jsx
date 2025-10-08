// src/components/SaleTransactions.jsx
import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function SaleTransactions({ transactions, onView, onDelete }) {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");
  const pageSize = 20;

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  const formatDate = (dateStr) => {
    const d = parseDate(dateStr);
    if (!d || isNaN(d)) return dateStr || "-";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const filtered = useMemo(() => {
    const rawSearch = search.toLowerCase();
    const numericSearch = search.replace(/\D/g, "");

    return (
      (transactions || [])
        .filter((tx) => {
          const customerName = String(tx.customer ?? "").toLowerCase();
          const customerPhone = (tx.customerInfo?.contactPhone || "").replace(
            /\D/g,
            ""
          );
          const matchesText =
            rawSearch === "" ||
            customerName.includes(rawSearch) ||
            (numericSearch && customerPhone.includes(numericSearch)) ||
            tx.items?.some((it) =>
              String(it.product ?? "")
                .toLowerCase()
                .includes(rawSearch)
            );

          const txDate = parseDate(tx.date);
          const matchesStart =
            !startDate ||
            (txDate && txDate >= new Date(startDate + "T00:00:00"));
          const matchesEnd =
            !endDate || (txDate && txDate <= new Date(endDate + "T23:59:59"));

          const monthKey = txDate
            ? `${String(txDate.getMonth() + 1).padStart(
                2,
                "0"
              )}-${txDate.getFullYear()}`
            : "";
          const matchesMonth = !filterMonth || monthKey === filterMonth;

          return matchesText && matchesStart && matchesEnd && matchesMonth;
        })
        // Sort by date descending (latest first)
        .sort((a, b) => parseDate(b.date) - parseDate(a.date))
    );
  }, [transactions, search, startDate, endDate, filterMonth]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const totalSale = filtered.reduce(
    (sum, tx) => sum + (parseFloat(tx.total) || 0),
    0
  );
  const totalPaid = filtered.reduce(
    (sum, tx) => sum + (parseFloat(tx.paid) || 0),
    0
  );
  const totalPending = filtered.reduce(
    (sum, tx) => sum + (parseFloat(tx.pending) || 0),
    0
  );

  // const monthWiseTotals = useMemo(() => {
  //   const map = {};
  //   filtered.forEach((tx) => {
  //     const d = parseDate(tx.date);
  //     if (!d) return;
  //     const key = `${String(d.getMonth() + 1).padStart(
  //       2,
  //       "0"
  //     )}-${d.getFullYear()}`;
  //     if (!map[key]) map[key] = { total: 0, paid: 0, pending: 0, count: 0 };
  //     map[key].total += parseFloat(tx.total ?? 0);
  //     map[key].paid += parseFloat(tx.paid ?? 0);
  //     map[key].pending += parseFloat(tx.pending ?? 0);
  //     map[key].count += 1;
  //   });

  //   // Sort keys by actual date
  //   const sortedEntries = Object.entries(map).sort(([a], [b]) => {
  //     const [am, ay] = a.split("-").map(Number);
  //     const [bm, by] = b.split("-").map(Number);
  //     return new Date(by, bm - 1) - new Date(ay, am - 1); // latest first
  //   });

  //   return Object.fromEntries(sortedEntries);
  // }, [filtered]);

  const monthWiseTotals = useMemo(() => {
  const parseDMY = (str) => {
    if (!str) return null;
    const parts = str.split(/[\/\-]/); // handles both / and -
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
    const d = new Date(str);
    return isNaN(d) ? null : d;
  };

  const map = {};
  (transactions || []).forEach((tx) => {
    const d = parseDMY(tx.date);
    if (!d) return;

    const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

    if (!map[key]) map[key] = { total: 0, paid: 0, pending: 0, count: 0 };

    map[key].total += parseFloat(tx.total ?? 0);
    map[key].paid += parseFloat(tx.paid ?? 0);
    map[key].pending += parseFloat(tx.pending ?? 0);
    map[key].count += 1;
  });

  // Sort by most recent month first
  return Object.fromEntries(
    Object.entries(map).sort((a, b) => {
      const [am, ay] = a[0].split("-").map(Number);
      const [bm, by] = b[0].split("-").map(Number);
      return new Date(by, bm - 1) - new Date(ay, am - 1);
    })
  );
}, [transactions]);



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
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `transactions_${Date.now()}.csv`
    );
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
    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `transactions_${Date.now()}.xlsx`
    );
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

  const monthOptions = useMemo(() => {
    const set = new Set();
    (transactions || []).forEach((tx) => {
      const d = parseDate(tx.date);
      if (!d) return;
      set.add(
        `${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`
      );
    });

    return Array.from(set).sort((a, b) => {
      const [am, ay] = a.split("-").map(Number);
      const [bm, by] = b.split("-").map(Number);
      return new Date(by, bm - 1) - new Date(ay, am - 1); // latest first
    });
  }, [transactions]);

  return (
    <>
      {/* Search + Filters */}
      <div className="row g-2 mb-3 mt-5 text-center">
        <div
          className="col-md"
          style={{
            background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          <h1>📄 Sales Transactions</h1>
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
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
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
            className="btn btn-outline-success w-100"
            onClick={exportCSV}
            disabled={!filtered.length}
          >
            📥 CSV
          </button>
          <button
            className="btn btn-outline-primary w-100"
            onClick={exportExcel}
            disabled={!filtered.length}
          >
            📊 Excel
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div
        className="table-responsive mb-2 p-2 pt-4 pb-4 rounded fw-semibold text-center"
        style={{
          background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
        }}
      >
        <div className="table-responsive rounded">
          <table className="table table-bordered table-hover align-middle">
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
                  <td colSpan={10} className="text-center text-muted">
                    No transactions found 🚫
                  </td>
                </tr>
              ) : (
                // ✅ Sort by date (latest first) before mapping
                [...paginated]
                  .sort((a, b) => {
                    const da = new Date(a.date);
                    const db = new Date(b.date);
                    return db - da; // Newest first
                  })
                  .map((tx, i) => (
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
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center gap-4 align-items-center mt-2 pb-4">
          <button
            className="btn btn-outline-secondary bg-danger text-white"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ⬅️ Previous
          </button>
          <span className="fw-bold text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline-secondary bg-danger text-white"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next ➡️
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
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

      {/* Month-wise totals */}
      <div className="table-responsive mb-5">
        <h3 className="text-center text-primary">📊Month-wise Totals</h3>
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
