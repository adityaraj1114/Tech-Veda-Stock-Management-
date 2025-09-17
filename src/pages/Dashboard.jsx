// src/pages/Dashboard.jsx
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { InventoryContext } from "../context/InventoryContext";
import { SalesContext } from "../context/SalesContext";
import { PurchaseContext } from "../context/PurchaseContext";
import CurrentStock from "../components/CurrentStock";

const Dashboard = () => {
  const { getInventory, resetData } = useContext(InventoryContext);
  const { sales } = useContext(SalesContext);
  const { purchases } = useContext(PurchaseContext);

  const navigate = useNavigate();

  // ✅ Calculate totals safely
  const totalSales = sales.reduce(
    (sum, s) => sum + (parseFloat(s.total) || (s.quantity * s.price) || 0),
    0
  );

  // 🔥 Use totalCost from purchases (already aggregated in PurchaseContext)
  const totalPurchase = purchases.reduce(
    (sum, p) => sum + (parseFloat(p.totalCost) || 0),
    0
  );

  const profit = totalSales - totalPurchase;

  // ✅ Prepare transactions
  const salesTx = sales.map((s) => ({
    id: s.id,
    type: "Sale",
    date: s.date,
    details: `${s.product} × ${s.quantity}`,
    amount: parseFloat(s.total) || (s.quantity * s.price) || 0,
  }));

  const purchaseTx = purchases.map((p) => ({
    id: p.id,
    type: "Purchase",
    date: p.date,
    details: `${p.items.length} items`, // ✅ Show count of purchased items
    amount: parseFloat(p.totalCost) || 0,
  }));

  const transactions = [...salesTx, ...purchaseTx].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const recentActivity = transactions.slice(0, 10);
  const inventory = getInventory();

  return (
    <div className="container mt-4">
      {/* Header with reset button */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded-4 shadow-sm">
        <h1 className="h3">📊 Dashboard</h1>
        <button className="btn btn-outline-danger btn-sm" onClick={resetData}>
          🔄 Reset All Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div
            className="card shadow-sm p-3 text-center bg-light border-success"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/sale")}
          >
            <h5>Total Sales</h5>
            <p className="fw-bold text-success">₹{totalSales.toFixed(2)}</p>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="card shadow-sm p-3 text-center bg-light border-primary"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/purchase")}
          >
            <h5>Total Purchases</h5>
            <p className="fw-bold text-primary">₹{totalPurchase.toFixed(2)}</p>
          </div>
        </div>

        <div
          className="col-md-3"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/profit-loss")}
        >
          <div className="card shadow-sm p-3 text-center bg-light">
            <h5>Profit / Loss</h5>
            <p
              className={`fw-bold ${
                profit >= 0 ? "text-success" : "text-danger"
              }`}
            >
              ₹{profit.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm p-3 text-center bg-light border-warning">
            <h5>Transactions</h5>
            <p className="fw-bold text-warning">{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* ✅ Current Stock with scrollable box */}
      <div
        className="card shadow-sm p-1 mb-4"
        style={{
          maxHeight: "400px", // ~10 rows max
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        {/* <h5 className="mb-3">📦 Current Stock</h5> */}
        <CurrentStock inventory={inventory} />
      </div>

      {/* Recent Activity */}
      <div className="card shadow-sm p-3 mt-4">
        <h5 className="mb-3">🕒 Recent Activity</h5>
        <div className="table-responsive">
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
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No activity yet 🚫
                  </td>
                </tr>
              ) : (
                recentActivity.map((act, i) => (
                  <tr key={`${act.type}-${act.id}-${i}`}>
                    <td>{act.date}</td>
                    <td>
                      <span
                        className={`badge ${
                          act.type === "Sale" ? "bg-success" : "bg-primary"
                        }`}
                      >
                        {act.type}
                      </span>
                    </td>
                    <td>{act.details}</td>
                    <td className="fw-bold">₹{act.amount.toFixed(2)}</td>
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

export default Dashboard;
