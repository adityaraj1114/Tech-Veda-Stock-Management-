import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import { useNavigate } from "react-router-dom";

export default function CustomerList() {
  const { customers = [], deleteCustomer } = useInventory();
  const nav = useNavigate();
  const [search, setSearch] = useState("");

  // Filter customers safely (ignore blank names)
  const filtered = customers
    .filter((c) => c?.name && c.name.trim() !== "")
    .filter((c) =>
      (c?.name || "").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="container mt-4">
      <h2>🧑‍🤝‍🧑 Customers</h2>

      {/* Search Bar */}
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
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Purchase (₹)</th>
                <th>Paid (₹)</th>
                <th>Pending (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>₹{c?.totalPurchase || 0}</td>
                  <td>₹{c?.paidAmount || 0}</td>
                  <td>₹{c?.pendingAmount || 0}</td>
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
                          window.confirm(`Delete ${c?.name || "this customer"}?`)
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
