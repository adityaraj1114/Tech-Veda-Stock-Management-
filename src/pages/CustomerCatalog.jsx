// src/pages/CustomerCatalog.jsx
import { useState, useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function CustomerCatalog() {
  const { getInventory } = useContext(InventoryContext);
  const stockProducts = getInventory() || [];

  // ✅ Load initial state from localStorage
  const [catalogProducts, setCatalogProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("catalogProducts")) || [];
  });
  const [hiddenProducts, setHiddenProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("hiddenProducts")) || [];
  });

  const [selectedProduct, setSelectedProduct] = useState("new");
  const [formData, setFormData] = useState({
    name: "",
    buyingPrice: "",
    sellingPrice: "",
  });
  const [profitPercent, setProfitPercent] = useState("");
  const [showBuyingPrice, setShowBuyingPrice] = useState(true); // 👁️ Toggle

  // ✅ Save to localStorage
  const saveCatalog = (data) =>
    localStorage.setItem("catalogProducts", JSON.stringify(data));
  const saveHidden = (data) =>
    localStorage.setItem("hiddenProducts", JSON.stringify(data));

  // Select Product
  const handleSelectProduct = (value) => {
    setSelectedProduct(value);
    setProfitPercent("");
    if (value === "new") {
      setFormData({ name: "", buyingPrice: "", sellingPrice: "" });
    } else {
      const product = stockProducts.find((p) => p.item === value);
      if (product) {
        setFormData({
          name: product.item,
          buyingPrice: product.buyingPrice,
          sellingPrice: product.sellingPrice,
        });
      }
    }
  };

  const handleDelete = (id) => {
  if (window.confirm("Delete this product permanently?")) {
    setHiddenProducts((prev) => prev.filter((p) => p.id !== id));
    // Optional: localStorage update or backend call
  }
};


  // Profit % → auto calculate SP
  const handleProfitChange = (val) => {
    setProfitPercent(val);
    const bp = parseFloat(formData.buyingPrice) || 0;
    const percent = parseFloat(val) || 0;
    const sp = bp + (bp * percent) / 100;
    setFormData((prev) => ({
      ...prev,
      sellingPrice: sp.toFixed(2),
    }));
  };

  // Add Product
  const handleAddProduct = () => {
    if (!formData.name || !formData.sellingPrice) {
      alert("Please enter product name and selling price.");
      return;
    }
    const newItem = {
      id: Date.now(),
      name: formData.name,
      buyingPrice: parseFloat(formData.buyingPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
    };
    const updated = [...catalogProducts, newItem];
    setCatalogProducts(updated);
    saveCatalog(updated);
    setSelectedProduct("new");
    setFormData({ name: "", buyingPrice: "", sellingPrice: "" });
    setProfitPercent("");
  };

  // Hide / Unhide
  const handleHide = (id) => {
    const product = catalogProducts.find((p) => p.id === id);
    if (product) {
      const updatedCatalog = catalogProducts.filter((p) => p.id !== id);
      const updatedHidden = [...hiddenProducts, product];
      setCatalogProducts(updatedCatalog);
      setHiddenProducts(updatedHidden);
      saveCatalog(updatedCatalog);
      saveHidden(updatedHidden);
    }
  };

  const handleUnhide = (id) => {
    const product = hiddenProducts.find((p) => p.id === id);
    if (product) {
      const updatedHidden = hiddenProducts.filter((p) => p.id !== id);
      const updatedCatalog = [...catalogProducts, product];
      setHiddenProducts(updatedHidden);
      setCatalogProducts(updatedCatalog);
      saveHidden(updatedHidden);
      saveCatalog(updatedCatalog);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(catalogProducts);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Catalog");
    XLSX.writeFile(wb, "CustomerCatalog.xlsx");
  };

  // Export PDF (Only Selling Price)
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("My Shop (Product Price List)", 14, 15);
    const tableData = catalogProducts.map((p, index) => [
      index + 1,
      p.name,
      `₹${p.sellingPrice}`,
    ]);

    doc.autoTable({
      head: [["S.No", "Product Name", "Selling Price"]],
      body: tableData,
      startY: 25,
    });

    doc.save("CustomerCatalog.pdf");
  };

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-3">📦 Customer Catalog</h2>
      {/* ---- Form Section ---- */}
      <div className="card p-3 shadow-sm mb-4">
        <h5>Add / Update Catalog Product</h5>
        <div className="row g-2 align-items-end">
          {/* Select Product */}
          <div className="col-md-3">
            <label className="form-label">Select / Add</label>
            <select
              className="form-select"
              value={selectedProduct}
              onChange={(e) => handleSelectProduct(e.target.value)}
            >
              <option value="new">➕ Add New Product</option>
              {stockProducts.map((p, i) => (
                <option key={i} value={p.item}>
                  {p.item}
                </option>
              ))}
            </select>
          </div>

          <p className="text-center pt-2">or</p>

          {/* Product Name */}
          <div className="col-md-2">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={selectedProduct !== "new"}
            />
          </div>

          {/* Profit % */}
          <div className="col-md-2">
            <label className="form-label">Profit %</label>
            <input
              type="number"
              className="form-control"
              value={profitPercent}
              onChange={(e) => handleProfitChange(e.target.value)}
            />
          </div>

          {/* Buying Price */}
          <div className="col-md-2">
            <label className="form-label">Buying Price</label>
            <input
              type="number"
              className="form-control"
              value={formData.buyingPrice}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  buyingPrice: e.target.value,
                }))
              }
            />
          </div>

          {/* Selling Price */}
          <div className="col-md-2">
            <label className="form-label">Selling Price</label>
            <input
              type="number"
              className="form-control"
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sellingPrice: e.target.value,
                }))
              }
            />
          </div>

          {/* Add Btn */}
          <div className="col-md-1">
            <button
              className="btn btn-primary w-100"
              onClick={handleAddProduct}
            >
              Add
            </button>
          </div>
        </div>
      </div>
      {/* ---- Catalog Table ---- */}
      <div className="">
        <div>
          <h3>Active Catalog Products</h3>
        </div>
        <div className="d-flex gap-2 justify-content-between align-items-center mt-4 mb-4">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowBuyingPrice(!showBuyingPrice)}
          >
            {showBuyingPrice ? "🙈 Hide(BP)" : "👁 Show(BP)"}
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={handleExportExcel}
          >
            ⬇ Excel
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleExportPDF}>
            📄 PDF
          </button>
        </div>
      </div>
      {catalogProducts.length === 0 ? (
        <p>No active catalog products.</p>
      ) : (
        <div className="table-responsive mb-4">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Name</th>
                {showBuyingPrice && <th>Buying Price</th>}
                <th>Selling Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {catalogProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  {showBuyingPrice && <td>₹{p.buyingPrice}</td>}
                  <td>₹{p.sellingPrice}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleHide(p.id)}
                    >
                      Hide
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      ---- Hidden Table ----
      {/* ---- Hidden Table ---- */}
      <div className="mb-5 pb-5">
        <h3>Hidden Products</h3>
        {hiddenProducts.length === 0 ? (
          <p>No hidden products.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Buying Price</th>
                  <th>Selling Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {hiddenProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>₹{p.buyingPrice}</td>
                    <td>₹{p.sellingPrice}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleUnhide(p.id)}
                        >
                          Unhide
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
