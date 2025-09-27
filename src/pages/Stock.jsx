// src/pages/Stock.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import CurrentStock from "../components/CurrentStock";
import { Search } from "lucide-react"; // ✅ Lucide icons

export default function Stock() {
  const [search, setSearch] = useState("");

  return (
    <div className="container mt-4 pb-5">
      {/* Page Heading */}
      <motion.h2
        className="mb-4 fw-bold text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(90deg, #6a11cb, #2575fc)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "1.6rem",
        }}
      >
        📦 Stock Management
      </motion.h2>

      {/* Search bar */}
      <motion.div
        className="row g-2 mb-4 justify-content-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="col-md-6">
          <div
            className="d-flex align-items-center px-3 py-2 rounded-4 shadow"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Search size={20} className="me-2 text-primary" />
            <input
              type="text"
              className="form-control border-0 bg-transparent text-dark"
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ outline: "none", boxShadow: "none" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Current Stock List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <CurrentStock search={search} />
      </motion.div>
    </div>
  );
}
