import React, { useState } from "react";
import CurrentStock from "../components/CurrentStock";

export default function Stock() {
  const [search, setSearch] = useState("");

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📦 Stock Management</h2>

      {/* Search bar for stock items */}
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="🔍 Search by product name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Current Stock from Context */}
      <CurrentStock search={search} />
    </div>
  );
}
