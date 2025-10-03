// src/pages/CurrentStock.jsx
import React, { useContext, useMemo, useState } from "react";
import { InventoryContext } from "../context/InventoryContext";
import { useSales } from "../context/SalesContext";
import { PurchaseContext } from "../context/PurchaseContext";
import { motion } from "framer-motion";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const CurrentStock = ({ search = "" }) => {
  const { getInventory, deleteStockItem } = useContext(InventoryContext);
  const { sales } = useSales();
  const { getPurchasedItems } = useContext(PurchaseContext);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const pageSize = 20;

  const inventory = Array.isArray(getInventory()) ? getInventory() : [];

  const inventoryWithStock = useMemo(() => {
    const purchasedItems = getPurchasedItems();

    return inventory.map((inv) => {
      const purchasedQty = purchasedItems
        .filter((p) => p.item === inv.item)
        .reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

      const soldQty = sales
        .filter((s) => s.product === inv.item)
        .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

      const inStock = purchasedQty - soldQty;
      const buyingPrice = Number(inv.buyingPrice) || 0;
      const sellingPrice = Number(inv.sellingPrice) || 0;

      // ✅ Total value based on buying price
      const totalValue = buyingPrice * inStock;

      return {
        ...inv,
        purchased: purchasedQty,
        sold: soldQty,
        inStock,
        buyingPrice,
        sellingPrice,
        totalValue,
      };
    });
  }, [inventory, sales, getPurchasedItems]);

  const filteredInventory = inventoryWithStock.filter((inv) =>
    (inv.item || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredInventory.length / pageSize);
  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInventory.slice(start, start + pageSize);
  }, [filteredInventory, currentPage]);

  const grandTotalValue = filteredInventory.reduce(
    (sum, inv) => sum + (inv.totalValue || 0),
    0
  );

  const exportCSV = () => {
    const data = filteredInventory.map((inv) => ({
      Item: inv.item,
      "Buying Price (₹)": inv.buyingPrice.toFixed(2),
      "Selling Price (₹)": inv.sellingPrice.toFixed(2),
      Purchased: inv.purchased,
      Sold: inv.sold,
      "In Stock": inv.inStock,
      "Total Value (₹)": inv.totalValue.toFixed(2),
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `current_stock_${Date.now()}.csv`);
  };

  const exportExcel = () => {
    const data = filteredInventory.map((inv) => ({
      Item: inv.item,
      "Buying Price (₹)": inv.buyingPrice.toFixed(2),
      "Selling Price (₹)": inv.sellingPrice.toFixed(2),
      Purchased: inv.purchased,
      Sold: inv.sold,
      "In Stock": inv.inStock,
      "Total Value (₹)": inv.totalValue.toFixed(2),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CurrentStock");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `current_stock_${Date.now()}.xlsx`);
  };

  const toggleSelect = (itemName) => {
    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((x) => x !== itemName)
        : [...prev, itemName]
    );
  };

  const selectAllOnPage = () => {
    const itemsOnPage = paginatedInventory.map((inv) => inv.item);
    const allSelected = itemsOnPage.every((item) =>
      selectedItems.includes(item)
    );
    setSelectedItems((prev) =>
      allSelected
        ? prev.filter((item) => !itemsOnPage.includes(item))
        : [...prev, ...itemsOnPage]
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedItems.length) return alert("No items selected.");
    if (!window.confirm("Delete selected items from stock?")) return;
    selectedItems.forEach((item) => deleteStockItem(item));
    setSelectedItems([]);
  };

  const handleDeleteAll = () => {
    if (!filteredInventory.length) return;
    if (!window.confirm("Delete all filtered stock items?")) return;
    filteredInventory.forEach((inv) => deleteStockItem(inv.item));
    setSelectedItems([]);
  };

  if (!filteredInventory.length) {
    return <p className="text-muted">No stock data available 🚫</p>;
  }

  return (
    <>
      {/* Export + Bulk Actions */}
      <div className="mb-3">
        <div className="d-flex gap-2 mb-2">
          <button className="btn btn-outline-success" onClick={exportCSV}>
            📥 Export CSV
          </button>
          <button className="btn btn-outline-primary" onClick={exportExcel}>
            📊 Export Excel
          </button>
        </div>
      </div>
      <motion.div
        className="card shadow-sm p-3 mb-3"
        style={{
          background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
          borderRadius: "20px",
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h5 className="mb-3 text-white">📦 Current Stock</h5>

        {/* Stock Table */}
        <div className="table-responsive rounded">
          <table className="table table-bordered align-middle">
            <thead className="table-secondary">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={selectAllOnPage}
                    checked={
                      paginatedInventory.length > 0 &&
                      paginatedInventory.every((inv) =>
                        selectedItems.includes(inv.item)
                      )
                    }
                  />
                </th>
                <th>No.</th>
                <th>Item</th>
                <th>Purchased</th>
                <th>Sold</th>
                <th>In Stock</th>
                <th>Buying Price (₹)</th>
                <th>Selling Price (₹)</th>
                <th>Total Value (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInventory.map((inv, i) => (
                <tr key={`${inv.item || "item"}_${i}`}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(inv.item)}
                      onChange={() => toggleSelect(inv.item)}
                    />
                  </td>
                  <td>{(currentPage - 1) * pageSize + i + 1}</td>
                  <td>{inv.item || "N/A"}</td>
                  <td className="text-primary">{inv.purchased || 0}</td>
                  <td className="text-primary">{inv.sold || 0}</td>
                  <td
                    className={`fw-bold ${
                      inv.inStock > 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {inv.inStock}
                  </td>
                  <td>₹{(inv.buyingPrice || 0).toFixed(2)}</td>
                  <td>₹{(inv.sellingPrice || 0).toFixed(2)}</td>
                  <td>₹{(inv.totalValue || 0).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteStockItem(inv.item)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}

              {/* Summary Row */}
              <tr className="table-secondary fw-bold">
                <td colSpan="8" className="text-end">
                  Grand Total Value:
                </td>
                <td colSpan="2">₹{grandTotalValue.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-center gap-4 align-items-center mb-4">
          <button
            className="btn btn-sm btn-outline-dark bg-danger text-white ms-2 mt-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ⬅️ Prev
          </button>
          <span className="mt-2 text-white">
            {" "}
            Page {currentPage} of {totalPages}{" "}
          </span>
          <button
            className="btn btn-sm btn-outline-dark text-white bg-danger ms-1"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            ➡️ Next
          </button>
        </div>
      </motion.div>
      <div className="d-flex gap-2 mb-5">
        <button
          className="btn btn-outline-danger"
          onClick={handleDeleteSelected}
          disabled={!selectedItems.length}
        >
          🗑 Del Selected
        </button>
        <button
          className="btn btn-danger"
          onClick={handleDeleteAll}
          disabled={!filteredInventory.length}
        >
          🧹 Delete All
        </button>
      </div>
    </>
  );
};

export default CurrentStock;
