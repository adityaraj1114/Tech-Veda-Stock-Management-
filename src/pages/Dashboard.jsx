// src/pages/Dashboard.jsx
import React, { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";
import CurrentStock from "../components/CurrentStock";

const Dashboard = () => {
  const {
    getProfitLoss,
    getInventory,
    getTransactions,
    resetData,           // <- new
  } = useContext(InventoryContext);

  // Summaries
  const { totalPurchase, totalSales, profit } = getProfitLoss();
  const inventory = getInventory();
  const transactions = getTransactions();
  const recentActivity = transactions.slice(0, 10);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">📊 Dashboard</h1>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={resetData}
        >
          🔄 Reset All Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm p-3 text-center">
            <h5>Total Sales</h5>
            <p className="fw-bold text-success">₹{totalSales}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3 text-center">
            <h5>Total Purchases</h5>
            <p className="fw-bold text-primary">₹{totalPurchase}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3 text-center">
            <h5>Profit / Loss</h5>
            <p
              className={`fw-bold ${
                profit >= 0 ? "text-success" : "text-danger"
              }`}
            >
              ₹{profit}
            </p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3 text-center">
            <h5>Transactions</h5>
            <p className="fw-bold text-warning">{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Current Stock */}
      <CurrentStock inventory={inventory} />

      {/* Recent Activity */}
      <div className="card shadow-sm p-3">
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
                recentActivity.map((act) => (
                  <tr key={act.id}>
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
                    <td className="fw-bold">₹{act.amount}</td>
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
