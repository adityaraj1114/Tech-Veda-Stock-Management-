// src/pages/Dashboard.jsx
import React, { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";

const Dashboard = () => {
  const { sales, purchases, getInventory, getProfitLoss } =
    useContext(InventoryContext);

  // ✅ Totals (context se calculate karte hain)
  const { totalPurchase, totalSales, profit } = getProfitLoss();

  // ✅ Recent Activity (sales + purchases merge)
  const recentActivity = [
    ...sales.map((s) => ({
      date: s.date,
      type: "Sale",
      details: `${s.customer} bought ${s.quantity} × ${s.product}`,
      amount: s.totalAmount,
    })),
    ...purchases.map((p) => ({
      date: p.date,
      type: "Purchase",
      details: `${p.supplier} supplied ${p.quantity} × ${p.item}`,
      amount: p.totalCost,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // latest first
    .slice(0, 10); // last 10 activities

  // ✅ Inventory summary
  const inventory = getInventory();

  return (
    <div className="container mt-4">
      <h1 className="h3 mb-4">📊 Dashboard</h1>

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
            <p className="fw-bold text-warning">
              {sales.length + purchases.length}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card shadow-sm p-3 mb-4">
        <h5 className="mb-3">📦 Current Stock</h5>
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Item</th>
                <th>Purchased</th>
                <th>Sold</th>
                <th>In Stock</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No inventory data yet 🚫
                  </td>
                </tr>
              ) : (
                inventory.map((inv, i) => (
                  <tr key={i}>
                    <td>{inv.item}</td>
                    <td>{inv.purchased}</td>
                    <td>{inv.sold}</td>
                    <td
                      className={`fw-bold ${
                        inv.inStock > 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {inv.inStock}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activities */}
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
                recentActivity.map((act, i) => (
                  <tr key={i}>
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
