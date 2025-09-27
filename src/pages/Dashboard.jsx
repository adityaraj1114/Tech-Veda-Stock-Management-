import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { InventoryContext } from "../context/InventoryContext";
import { SalesContext } from "../context/SalesContext";
import { PurchaseContext } from "../context/PurchaseContext";
import CurrentStock from "../components/CurrentStock";
import { motion } from "framer-motion";

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

  const totalPurchase = purchases.reduce(
    (sum, p) => sum + (parseFloat(p.totalCost) || 0),
    0
  );

  const profit = totalSales - totalPurchase;

  // ✅ Transactions
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
    details: `${p.items.length} items`,
    amount: parseFloat(p.totalCost) || 0,
  }));

  const transactions = [...salesTx, ...purchaseTx].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const recentActivity = transactions.slice(0, 10);
  const inventory = getInventory();

  // 🎨 Gradient Styles
  const gradientStyles = {
    sales: "linear-gradient(135deg, #6a09cbff, #b707cfff)", // violet → pink
    purchase: "linear-gradient(135deg, #085ec6ff, #09acd8ff)", // blue
    profit: "linear-gradient(135deg, #cd5a08ff, #e71379ff)", // orange-pink
    tx: "linear-gradient(135deg, #05b3caff, #286708ff)", // green-blue
  };

  // 🌀 Motion Variants
  const cardVariants = {
    hover: { scale: 1.05, boxShadow: "0px 8px 25px rgba(0,0,0,0.2)" },
  };

  return (
    <div className="container mt-4 mb-5 pb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-4 shadow-sm"
        style={{ background: "linear-gradient(135deg, #7F00FF, #00c6ff)", color: "#fff" }}
      >
        <h1 className="h3 mb-0">📊 Dashboard</h1>
        <button className="btn btn-light btn-sm fw-bold" onClick={resetData}>
          🔄 Reset All Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        {/* Sales */}
        <div className="col-md-3">
          <motion.div
            className="card text-center text-white p-3 rounded-4"
            style={{ cursor: "pointer", background: gradientStyles.sales }}
            onClick={() => navigate("/sale")}
            whileHover="hover"
            variants={cardVariants}
          >
            <h5>Total Sales</h5>
            <p className="fw-bold fs-5">₹{totalSales.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Purchases */}
        <div className="col-md-3">
          <motion.div
            className="card text-center text-white p-3 rounded-4"
            style={{ cursor: "pointer", background: gradientStyles.purchase }}
            onClick={() => navigate("/purchase")}
            whileHover="hover"
            variants={cardVariants}
          >
            <h5>Total Purchases</h5>
            <p className="fw-bold fs-5">₹{totalPurchase.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Profit / Loss */}
        <div className="col-md-3">
          <motion.div
            className="card text-center text-white p-3 rounded-4"
            style={{ background: gradientStyles.profit }}
            whileHover="hover"
            variants={cardVariants}
          >
            <h5>Profit / Loss</h5>
            <p className={`fw-bold fs-5`}>
              {profit >= 0 ? `+₹${profit.toFixed(2)}` : `-₹${Math.abs(profit).toFixed(2)}`}
            </p>
          </motion.div>
        </div>

        {/* Transactions */}
        <div className="col-md-3">
          <motion.div
            className="card text-center text-white p-3 rounded-4"
            style={{ background: gradientStyles.tx }}
            whileHover="hover"
            variants={cardVariants}
          >
            <h5>Transactions</h5>
            <p className="fw-bold fs-5">{transactions.length}</p>
          </motion.div>
        </div>
      </div>

      {/* ✅ Current Stock */}
      <div
        className="card shadow-sm p-1 mb-4 rounded-4"
        style={{
          maxHeight: "400px",
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        <CurrentStock inventory={inventory} />
      </div>

      {/* Recent Activity */}
      <div className="card shadow-sm p-3 mt-4 rounded-4">
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
