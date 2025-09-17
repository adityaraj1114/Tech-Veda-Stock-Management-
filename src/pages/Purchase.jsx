import React, { useState, useMemo } from "react";
import { usePurchase } from "../context/PurchaseContext";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function Purchases() {
  const {
    purchases,
    purchaseCart,
    addToPurchaseCart,
    completePurchase,
    deletePurchase,
    getTotalPurchaseAmount,
  } = usePurchase();

  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [search, setSearch] = useState("");

  // 🔍 Filtered purchases by supplier
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) =>
      p.supplier.toLowerCase().includes(search.toLowerCase())
    );
  }, [purchases, search]);

  // ➕ Add item to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!supplier || !item || !quantity || !cost) return;

    addToPurchaseCart({
      item,
      quantity: parseInt(quantity, 10),
      cost: parseFloat(cost),
    });

    setItem("");
    setQuantity("");
    setCost("");
  };

  // ✅ Complete purchase
  const handleCompletePurchase = () => {
    if (!supplier || purchaseCart.length === 0) return;
    completePurchase(supplier);
    setSupplier("");
  };

  // 📄 Export CSV
  const exportCSV = () => {
    if (!filteredPurchases.length) return;

    const data = filteredPurchases.map((p) => ({
      Date: p.date,
      Supplier: p.supplier,
      "Total Cost (₹)": p.totalCost.toFixed(2),
      Items: p.items.map((it) => `${it.item} (${it.quantity})`).join(", "),
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `purchases_${Date.now()}.csv`);
  };

  // 📊 Export Excel
  const exportExcel = () => {
    if (!filteredPurchases.length) return;

    const data = filteredPurchases.map((p) => ({
      Date: p.date,
      Supplier: p.supplier,
      "Total Cost (₹)": p.totalCost.toFixed(2),
      Items: p.items.map((it) => `${it.item} (${it.quantity})`).join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `purchases_${Date.now()}.xlsx`);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📦 Purchase Management</h2>

      {/* ✅ Total Purchase Summary Box */}
      <div className="alert alert-info d-flex justify-content-between align-items-center shadow-sm">
        <strong>💰 Total Purchased:</strong>
        <span className="fs-5 fw-bold text-success">
          ₹{getTotalPurchaseAmount().toFixed(2)}
        </span>
      </div>

      {/* Add Purchase Form */}
      <form onSubmit={handleAddToCart} className="row g-2 mb-3">
        <div className="col-md">
          <input
            type="text"
            className="form-control"
            placeholder="Supplier Name"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            required
          />
        </div>
        <div className="col-md">
          <input
            type="text"
            className="form-control"
            placeholder="Item"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            required
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="1"
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Cost per Unit"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            min="1"
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-primary">
            ➕ Add to Cart
          </button>
        </div>
      </form>

      {/* Cart Table */}
      {purchaseCart.length > 0 && (
        <div className="card p-3 mb-4">
          <h5>🛒 Current Cart</h5>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Cost</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchaseCart.map((p, i) => (
                <tr key={i}>
                  <td>{p.item}</td>
                  <td>{p.quantity}</td>
                  <td>₹{p.cost}</td>
                  <td className="fw-bold">₹{p.totalCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-success" onClick={handleCompletePurchase}>
            ✅ Complete Purchase
          </button>
        </div>
      )}

      {/* 🔍 Search + Export */}
      <div className="row g-2 mb-3">
        <div className="col-md">
          <input
            className="form-control"
            placeholder="🔍 Search by supplier"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-auto d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-success"
            onClick={exportCSV}
            disabled={!filteredPurchases.length}
          >
            📥 Export CSV
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={exportExcel}
            disabled={!filteredPurchases.length}
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Purchases History Table */}
      <div className="table-responsive">
        <h5>📑 Purchase Transactions</h5>
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>No.</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Total Cost (₹)</th>
              <th>View</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length > 0 ? (
              filteredPurchases
                .slice()
                .reverse()
                .map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.date}</td>
                    <td>{p.supplier}</td>
                    <td className="fw-bold text-danger">₹{p.totalCost}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => setSelectedPurchase(p)}
                      >
                        👁 View
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => deletePurchase(p.id)}
                        className="btn btn-sm btn-danger"
                      >
                        ❌ Delete
                      </button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No purchases found 🚫
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selectedPurchase && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Purchase Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedPurchase(null)}
                ></button>
              </div>
              {/* <div className="modal-body"> */}
                            <div className="modal-body">
                <p>
                  <b>Supplier:</b> {selectedPurchase.supplier} <br />
                  <b>Date:</b> {selectedPurchase.date}
                </p>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Cost</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.items.map((it, i) => (
                      <tr key={i}>
                        <td>{it.item}</td>
                        <td>{it.quantity}</td>
                        <td>₹{it.cost}</td>
                        <td className="fw-bold">₹{it.totalCost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="fw-bold">
                  Total Purchase: ₹{selectedPurchase.totalCost}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedPurchase(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

                