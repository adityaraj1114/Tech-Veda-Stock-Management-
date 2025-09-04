import React, { useState, useMemo } from "react";

export default function SaleTransactions({
  transactions,
  onView,
  onDelete,
}) {
  const [search, setSearch] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");

  // Filter and sort logic
  const filtered = useMemo(() => {
    return transactions
      // first filter by text and amount
      .filter((tx) => {
        const matchesText =
          tx.customer.toLowerCase().includes(search.toLowerCase()) ||
          (tx.product || "")
            .toLowerCase()
            .includes(search.toLowerCase());

        const amt = tx.amount ?? tx.total ?? 0;
        const aboveMin = minAmt === "" || amt >= parseFloat(minAmt);
        const belowMax = maxAmt === "" || amt <= parseFloat(maxAmt);

        return matchesText && aboveMin && belowMax;
      })
      // then sort newest first
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, search, minAmt, maxAmt]);

  return (
    <>
      {/* Search + Filter */}
      <div className="row g-2 mb-3 mt-5">
        <div className="col-md">
          <input
            className="form-control"
            placeholder="🔍 Search by cust or prod"
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
      </div>

      {/* Transactions Table */}
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
                <tr key={tx.id}>
                  <td>{i + 1}</td>
                  <td>{tx.date}</td>
                  <td>{tx.customer}</td>
                  <td className="fw-bold">
                    ₹{(tx.total ?? tx.amount).toFixed(2)}
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
