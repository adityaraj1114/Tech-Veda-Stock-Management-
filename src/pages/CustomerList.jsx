// src/components/CustomerList.jsx
import React, { useState, useMemo } from "react";
import { useInventory } from "../context/InventoryContext";
import { useNavigate } from "react-router-dom";

export default function CustomerList() {
  // ✅ customers अब inventory से आ रहे हैं
  const { customers = [], setCustomers, deleteCustomer } = useInventory();
  const nav = useNavigate();
  const [search, setSearch] = useState("");

  // ✅ Duplicate remove + search + sort
  const filtered = useMemo(() => {
    const seen = new Set();
    return customers
      .filter((c) => c?.name && c.name.trim() !== "")
      .filter((c) => {
        if (seen.has(c.name.toLowerCase())) return false;
        seen.add(c.name.toLowerCase());
        return true;
      })
      .filter((c) =>
        (c.name || "").toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [customers, search]);

  return (
    <div className="container mt-4">
      <h2>🧑‍🤝‍🧑 Customers</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="text-muted">No customers found 🚫</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Total Purchase (₹)</th>
                <th className="text-success">Paid (₹)</th>
                <th className="text-danger">Pending (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id || i}>
                  <td>{i + 1}</td>
                  <td>{c.name}</td>
                  <td>₹{parseFloat(c.totalPurchase || 0).toFixed(2)}</td>
                  <td className="text-success">
                    ₹{parseFloat(c.paidAmount || 0).toFixed(2)}
                  </td>
                  <td className="text-danger">
                    ₹{parseFloat(c.pendingAmount || 0).toFixed(2)}
                  </td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => nav(`/customers/${c.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete ${c.name || "this customer"}?`
                          )
                        ) {
                          deleteCustomer(c.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
