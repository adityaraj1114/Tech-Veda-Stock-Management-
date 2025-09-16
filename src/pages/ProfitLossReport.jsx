// src/pages/ProfitLossReport.jsx
import React, { useContext } from "react";
import { SalesContext } from "../context/SalesContext";
import { PurchaseContext } from "../context/PurchaseContext";

const ProfitLossReport = () => {
  const { sales } = useContext(SalesContext);
  const { purchases } = useContext(PurchaseContext);

  // ✅ Totals
  const totalSales = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  const totalPurchase = purchases.reduce(
    (sum, p) => sum + Number(p.total || 0),
    0
  );
  const profit = totalSales - totalPurchase;

  // ✅ All transactions
  const salesTx = sales.map((s) => ({
    id: s.id,
    type: "Sale",
    date: s.date,
    details: `${s.product} × ${s.quantity}`,
    amount: Number(s.total || 0),
  }));

  const purchaseTx = purchases.map((p) => ({
    id: p.id,
    type: "Purchase",
    date: p.date,
    details: `${p.product} × ${p.quantity}`,
    amount: Number(p.total || 0),
  }));

  const transactions = [...salesTx, ...purchaseTx].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="container mt-4">
      <div className="card shadow-sm p-3 mb-4">
        <h2>📈 Profit / Loss Report</h2>
        <div className="row text-center mt-3">
          <div className="col-md-4">
            <h5>Total Sales</h5>
            <p className="fw-bold text-success">₹{totalSales}</p>
          </div>
          <div className="col-md-4">
            <h5>Total Purchases</h5>
            <p className="fw-bold text-primary">₹{totalPurchase}</p>
          </div>
          <div className="col-md-4">
            <h5>Net Profit / Loss</h5>
            <p
              className={`fw-bold ${
                profit >= 0 ? "text-success" : "text-danger"
              }`}
            >
              ₹{profit}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card shadow-sm p-3">
        <h5>🧾 Transaction History</h5>
        <div className="table-responsive mt-3">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Details</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No transactions yet 🚫
                  </td>
                </tr>
              ) : (
                transactions.map((t, i) => (
                  <tr key={`${t.type}-${t.id}-${i}`}>
                    <td>{t.date}</td>
                    <td>
                      <span
                        className={`badge ${
                          t.type === "Sale" ? "bg-success" : "bg-primary"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td>{t.details}</td>
                    <td className="fw-bold">₹{t.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
