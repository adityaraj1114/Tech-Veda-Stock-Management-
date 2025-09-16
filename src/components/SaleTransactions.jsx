// src/components/SaleTransactions.jsx
import React, { useState, useMemo } from "react";
import Papa from "papaparse";
import { saveAs } from "file-saver";

export default function SaleTransactions({ transactions, onView, onDelete }) {
  const [search, setSearch] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");

  // 🔎 Filter + Sort (Recent first)
  const filtered = useMemo(() => {
    return (transactions || [])
      .filter((tx) => {
        const matchesText =
          (tx.customer || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
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
        return db - da; // ✅ Recent first
      });
  }, [transactions, search, minAmt, maxAmt]);

  // 📅 Date formatting helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr; // fallback: show raw string
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ⬇️ Export to CSV
  const exportCSV = () => {
    if (!filtered.length) return;

    const data = filtered.map((tx) => ({
      Date: formatDate(tx.date),
      Customer: tx.customer,
      "Total (₹)": parseFloat(tx.total ?? 0).toFixed(2),
      "Paid (₹)": parseFloat(tx.paid ?? 0).toFixed(2),
      "Pending (₹)": parseFloat(tx.pending ?? 0).toFixed(2),
      Items: tx.items?.map((it) => `${it.product} (${it.quantity})`).join(", "),
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `transactions_${Date.now()}.csv`);
  };

  return (
    <>
      {/* 🔍 Search + Filter */}
      <div className="row g-2 mb-3 mt-5">
        <div className="col-md">
          <input
            className="form-control"
            placeholder="🔍 Search by customer or product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Min Amount"
            value={minAmt}
            onChange={(e) => setMinAmt(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Max Amount"
            value={maxAmt}
            onChange={(e) => setMaxAmt(e.target.value)}
          />
        </div>
        <div className="col-md-auto d-flex align-items-center">
          <button
            className="btn btn-outline-success"
            onClick={exportCSV}
            disabled={!filtered.length}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* 📄 Transactions Table */}
      <div className="table-responsive mb-5">
        <h5>📄 Transactions</h5>
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total (₹)</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>View</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted">
                  No transactions found 🚫
                </td>
              </tr>
            ) : (
              filtered.map((tx, i) => (
                <tr key={tx.id || i}>
                  <td>{i + 1}</td>
                  <td>{formatDate(tx.date)}</td>
                  <td>{tx.customer}</td>
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
    </>
  );
}
