// components/TransactionsList.jsx
import React, { useMemo, useState } from "react";

/**
 * Props:
 * - transactions: array of transactions [{id, dateISO, dateDisplay, items, total}]
 * - onView(tx)
 * - onDelete(id)
 */
export default function TransactionsList({ transactions = [], onView, onDelete }) {
  const [filterType, setFilterType] = useState("all"); // all, day, month, year
  const [filterValue, setFilterValue] = useState(""); // yyyy-mm-dd or yyyy-mm or yyyy

  const filtered = useMemo(() => {
    if (!filterValue) return transactions;
    return transactions.filter((t) => {
      const d = new Date(t.dateISO || t.dateDisplay || t.id);
      if (filterType === "day") {
        const day = d.toISOString().slice(0, 10); // yyyy-mm-dd
        return day === filterValue;
      }
      if (filterType === "month") {
        const m = d.toISOString().slice(0, 7); // yyyy-mm
        return m === filterValue;
      }
      if (filterType === "year") {
        return d.getFullYear().toString() === filterValue;
      }
      return true;
    });
  }, [transactions, filterType, filterValue]);

  return (
    <div className="card p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Retailer Transactions</h5>
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm" value={filterType} onChange={(e) => { setFilterType(e.target.value); setFilterValue(""); }}>
            <option value="all">All</option>
            <option value="day">Filter by Day</option>
            <option value="month">Filter by Month</option>
            <option value="year">Filter by Year</option>
          </select>

          {filterType === "day" && <input type="date" className="form-control form-control-sm" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />}
          {filterType === "month" && <input type="month" className="form-control form-control-sm" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />}
          {filterType === "year" && <input type="number" min="2000" max="2100" placeholder="YYYY" className="form-control form-control-sm" value={filterValue} onChange={(e) => setFilterValue(e.target.value)} />}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted">No transactions found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Date & Time</th>
                <th>Items</th>
                <th>Total (₹)</th>
                <th>View</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td>{t.dateDisplay || new Date(t.dateISO).toLocaleString()}</td>
                  <td>{t.items.map((it) => `${it.name} x${it.qty}`).join(", ")}</td>
                  <td>₹{Number(t.total).toFixed(2)}</td>
                  <td><button className="btn btn-sm btn-info" onClick={() => onView(t)}>View</button></td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => onDelete(t.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
