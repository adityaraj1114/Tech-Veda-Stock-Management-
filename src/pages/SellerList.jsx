// src/components/SellerList.jsx
import React, { useState, useMemo } from "react";
import { useSeller } from "../context/SellerContext";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function SellerList() {
  const { sellers = [], deleteSeller } = useSeller();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const normalizePhone = (phone) =>
    (phone || "").replace(/\D/g, "").trim() || "NA";

  // Filter, dedupe, search, sort
  const filtered = useMemo(() => {
    const seen = new Set();
    let list = sellers
      .filter((s) => s.name?.trim())
      .filter((s) => {
        const key = `${s.name.trim().toLowerCase()}_${normalizePhone(
          s.contactPhone
        )}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .filter((s) => {
        const term = search.trim().toLowerCase();
        return (
          s.name.toLowerCase().includes(term) ||
          normalizePhone(s.contactPhone).includes(term.replace(/\D/g, ""))
        );
      });

    if (filterType === "pending") {
      list = list.filter((s) => parseFloat(s.pendingAmount || 0) > 0);
    } else if (filterType === "cleared") {
      list = list.filter((s) => parseFloat(s.pendingAmount || 0) <= 0);
    }

    return list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [sellers, search, filterType]);

  // Pagination slice
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  // Totals for footer
  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, s) => {
          acc.totalPurchase += parseFloat(s.totalPurchase || 0);
          acc.paidAmount += parseFloat(s.paidAmount || 0);
          acc.pendingAmount += parseFloat(s.pendingAmount || 0);
          return acc;
        },
        { totalPurchase: 0, paidAmount: 0, pendingAmount: 0 }
      ),
    [filtered]
  );

  // CSV export
  const exportCSV = () => {
    if (!filtered.length) return;
    const data = filtered.map((s, idx) => ({
      "No.": idx + 1,
      Name: s.name,
      Phone: normalizePhone(s.contactPhone),
      "Total Purchase (₹)": parseFloat(s.totalPurchase || 0).toFixed(2),
      "Paid (₹)": parseFloat(s.paidAmount || 0).toFixed(2),
      "Pending (₹)": parseFloat(s.pendingAmount || 0).toFixed(2),
    }));
    data.push({
      "No.": "—",
      Name: "TOTAL",
      Phone: "—",
      "Total Purchase (₹)": totals.totalPurchase.toFixed(2),
      "Paid (₹)": totals.paidAmount.toFixed(2),
      "Pending (₹)": totals.pendingAmount.toFixed(2),
    });
    const csv = Papa.unparse(data);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `sellers_${Date.now()}.csv`);
  };

  // Excel export
  const exportExcel = () => {
    if (!filtered.length) return;
    const data = filtered.map((s, idx) => ({
      No: idx + 1,
      Name: s.name,
      Phone: normalizePhone(s.contactPhone),
      "Total Purchase (₹)": parseFloat(s.totalPurchase || 0).toFixed(2),
      "Paid (₹)": parseFloat(s.paidAmount || 0).toFixed(2),
      "Pending (₹)": parseFloat(s.pendingAmount || 0).toFixed(2),
    }));
    data.push({
      No: "—",
      Name: "TOTAL",
      Phone: "—",
      "Total Purchase (₹)": totals.totalPurchase.toFixed(2),
      "Paid (₹)": totals.paidAmount.toFixed(2),
      "Pending (₹)": totals.pendingAmount.toFixed(2),
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sellers");
    XLSX.writeFile(wb, `sellers_${Date.now()}.xlsx`);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>🏪 Sellers</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success"
            onClick={exportCSV}
            disabled={!filtered.length}
          >
            📥 Export CSV
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={exportExcel}
            disabled={!filtered.length}
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="row mb-3 g-2">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Sellers</option>
            <option value="pending">Pending Balance Only</option>
            <option value="cleared">Cleared (No Pending)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <p className="text-muted">No sellers found 🚫</p>
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
              {paginated.map((s, i) => (
                <tr
                  key={s.id ?? `${s.name}_${normalizePhone(s.contactPhone)}`}
                >
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.contactPhone || "—"}</td>
                  <td>₹{parseFloat(s.totalPurchase || 0).toFixed(2)}</td>
                  <td className="text-success">
                    ₹{parseFloat(s.paidAmount || 0).toFixed(2)}
                  </td>
                  <td className="text-danger">
                    ₹{parseFloat(s.pendingAmount || 0).toFixed(2)}
                  </td>
                  <td className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => navigate(`/sellers/${s.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete ${s.name || "this seller"}?`
                          )
                        ) {
                          deleteSeller(s.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot
              className="table-light fw-bold"
              onClick={() => setFilterType("pending")}
              style={{ cursor: "pointer" }}
              title="Click to filter pending sellers"
            >
              <tr>
                <td colSpan={3} className="text-end">
                  TOTAL
                </td>
                <td>₹{totals.totalPurchase.toFixed(2)}</td>
                <td className="text-success">
                  ₹{totals.paidAmount.toFixed(2)}
                </td>
                <td className="text-danger">
                  ₹{totals.pendingAmount.toFixed(2)}
                </td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3 gap-2">
          <button
            className="btn btn-outline-secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ⬅ Prev
          </button>
          <span className="align-self-center">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-outline-secondary"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
}
