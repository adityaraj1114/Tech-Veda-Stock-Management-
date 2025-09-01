// src/components/CurrentStock.jsx
import React, { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";

const CurrentStock = () => {
  const { getInventory, deleteStockItem } = useContext(InventoryContext);
  const inventory = getInventory();

  if (!inventory.length) {
    return <p className="text-muted">No stock data available 🚫</p>;
  }

  return (
    <div className="card shadow-sm p-3 mb-4">
      <h5 className="mb-3">📦 Current Stock</h5>
      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Item</th>
              <th>Unit Price (₹)</th>
              <th>Purchased</th>
              <th>Sold</th>
              <th>In Stock</th>
              <th>Total Value (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((inv) => (
              <tr key={inv.item}>
                <td>{inv.item}</td>
                <td>₹{inv.unitPrice.toFixed(2)}</td>
                <td>{inv.purchased}</td>
                <td>{inv.sold}</td>
                <td
                  className={`fw-bold ${
                    inv.inStock > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {inv.inStock}
                </td>
                <td>₹{inv.totalValue.toFixed(2)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteStockItem(inv.item)}
                  >
                    ❌ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentStock;
