// src/components/CustomerList.jsx
import React, { useState, useMemo } from "react";
import { useCustomer } from "../context/CustomerContext"; // Updated: CustomerContext for proper deletion
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { saveAs } from "file-saver";

export default function CustomerList() {
  const { customers = [], deleteCustomer } = useCustomer(); // Using CustomerContext
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Normalize phone numbers for search & dedupe
  const normalizePhone = (phone) =>
    (phone || "").replace(/\D/g, "").trim() || "NA";

  // Filter, dedupe, search, sort
  const filtered = useMemo(() => {
    const seen = new Set();
    return customers
      .filter((c) => c?.name && c.name.trim() !== "")
      .filter((c) => {
        const key = `${c.name.trim().toLowerCase()}_${normalizePhone(
          c.contactPhone
        )}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .filter((c) => {
        const term = search.trim().toLowerCase();
        return (
          (c.name || "").toLowerCase().includes(term) ||
          normalizePhone(c.contactPhone).includes(term.replace(/\D/g, ""))
        );
      })
      .sort((a, b) => (b.id || 0) - (a.id || 0)); // Latest first
  }, [customers, search]);

  // Totals for summary row
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, c) => {
        acc.totalPurchase += parseFloat(c.totalPurchase || 0);
        acc.paidAmount += parseFloat(c.paidAmount || 0);
        acc.pendingAmount += parseFloat(c.pendingAmount || 0);
        return acc;
      },
      { totalPurchase: 0, paidAmount: 0, pendingAmount: 0 }
    );
  }, [filtered]);

  // Export Customers CSV
  const exportCSV = () => {
    if (!filtered.length) return;

    const data = filtered.map((c, idx) => ({
      "No.": idx + 1,
      Name: c.name,
      Phone: normalizePhone(c.contactPhone),
      "Total Purchase (₹)": parseFloat(c.totalPurchase || 0).toFixed(2),
      "Paid (₹)": parseFloat(c.paidAmount || 0).toFixed(2),
      "Pending (₹)": parseFloat(c.pendingAmount || 0).toFixed(2),
    }));

    // Add summary row at the bottom
    data.push({
      "No.": "—",
      Name: "TOTAL",
      Phone: "—",
      "Total Purchase (₹)": totals.totalPurchase.toFixed(2),
      "Paid (₹)": totals.paidAmount.toFixed(2),
      "Pending (₹)": totals.pendingAmount.toFixed(2),
    });

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `customers_${Date.now()}.csv`);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>🧑‍🤝‍🧑 Customers</h2>
        <button
          className="btn btn-outline-success"
          onClick={exportCSV}
          disabled={!filtered.length}
        >
          📥 Export CSV
        </button>
      </div>

      {/* Search bar */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by name or phone..."
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
                <th>Phone</th>
                <th>Total Purchase (₹)</th>
                <th className="text-success">Paid (₹)</th>
                <th className="text-danger">Pending (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id ?? `${c.name}_${normalizePhone(c.contactPhone)}`}
                >
                  <td>{i + 1}</td>
                  <td>{c.name}</td>
                  <td>{c.contactPhone || "—"}</td>
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
                      onClick={() => navigate(`/customers/${c.id}`)}
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
                          deleteCustomer(c.id); // ✅ Deletes customer and persists
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light fw-bold">
              <tr>
                <td colSpan={3} className="text-end">
                  TOTAL
                </td>
                <td>₹{totals.totalPurchase.toFixed(2)}</td>
                <td className="text-success">₹{totals.paidAmount.toFixed(2)}</td>
                <td className="text-danger">₹{totals.pendingAmount.toFixed(2)}</td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
