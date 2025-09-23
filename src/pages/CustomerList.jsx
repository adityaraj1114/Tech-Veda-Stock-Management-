// src/components/CustomerList.jsx
import React, { useState, useMemo } from "react";
import { useCustomer } from "../context/CustomerContext";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  FileText,
  Users,
  Trash2,
  Eye,
  Search,
} from "lucide-react";

export default function CustomerList() {
  const { customers = [], deleteCustomer } = useCustomer();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // all | pending | cleared
  const [page, setPage] = useState(1);
  const pageSize = 5; // Customers per page

  // Normalize phone
  const normalizePhone = (phone) =>
    (phone || "").replace(/\D/g, "").trim() || "NA";

  // Filter, dedupe, search, sort
  const filtered = useMemo(() => {
    const seen = new Set();
    let list = customers
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
      });

    // Advanced filter
    if (filterType === "pending") {
      list = list.filter((c) => Number(c.pendingAmount) > 0);
    } else if (filterType === "cleared") {
      list = list.filter((c) => Number(c.pendingAmount) <= 0);
    }

    // Sort latest first
    return list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [customers, search, filterType]);

  // Pagination
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  // Totals
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

  // Export CSV
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

  // Export Excel
  const exportExcel = () => {
    if (!filtered.length) return;
    const data = filtered.map((c, idx) => ({
      No: idx + 1,
      Name: c.name,
      Phone: normalizePhone(c.contactPhone),
      "Total Purchase (₹)": parseFloat(c.totalPurchase || 0).toFixed(2),
      "Paid (₹)": parseFloat(c.paidAmount || 0).toFixed(2),
      "Pending (₹)": parseFloat(c.pendingAmount || 0).toFixed(2),
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
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `customers_${Date.now()}.xlsx`);
  };

  return (
    <motion.div
      className="container mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <h2 className="fw-bold text-gradient d-flex align-items-center gap-2">
          <Users /> Customers
        </h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success d-flex align-items-center gap-1"
            onClick={exportCSV}
            disabled={!filtered.length}
          >
            <FileText size={18} /> CSV
          </button>
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-1"
            onClick={exportExcel}
            disabled={!filtered.length}
          >
            <FileSpreadsheet size={18} /> Excel
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <div className="input-group">
            <span className="input-group-text bg-light">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6 mb-2">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Customers</option>
            <option value="pending">Pending Balance Only</option>
            <option value="cleared">Cleared (No Pending)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <p className="text-muted">🚫 No customers found</p>
      ) : (
        <motion.div
          style={{ overflowX: "auto" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <table className="table table-hover align-middle shadow-sm">
            <thead className="table-dark">
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
              {paginated.map((c, i) => (
                <motion.tr
                  key={c.id ?? `${c.name}_${normalizePhone(c.contactPhone)}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <td>{(page - 1) * pageSize + i + 1}</td>
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
                      className="btn btn-sm btn-info d-flex align-items-center gap-1"
                      onClick={() => navigate(`/customers/${c.id}`)}
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      className="btn btn-sm btn-danger d-flex align-items-center gap-1"
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
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot className="table-light fw-bold">
              <tr>
                <td colSpan={3} className="text-end">
                  TOTAL
                </td>
                <td>₹{totals.totalPurchase.toFixed(2)}</td>
                <td className="text-success">₹{totals.paidAmount.toFixed(2)}</td>
                <td className="text-danger">
                  ₹{totals.pendingAmount.toFixed(2)}
                </td>
                <td>—</td>
              </tr>
            </tfoot>
          </table>
        </motion.div>
      )}

      {/* Pagination Controls */}
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
    </motion.div>
  );
}
