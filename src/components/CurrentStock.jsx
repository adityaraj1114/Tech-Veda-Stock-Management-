import React, { useContext } from "react";
import { InventoryContext } from "../context/InventoryContext";

const CurrentStock = () => {
  const { getInventory, deleteStockItem } = useContext(InventoryContext);

  // Ensure inventory is always an array
  const inventory = Array.isArray(getInventory()) ? getInventory() : [];

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
              <th>No.</th>
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
            {inventory.map((inv, i) => {
              const unitPrice = Number(inv.unitPrice) || 0;
              const purchased = Number(inv.purchased) || 0;
              const sold = Number(inv.sold) || 0;
              const inStock = Number(inv.inStock) || 0;
              const totalValue =
                Number(inv.totalValue) || unitPrice * inStock;

              return (
                <tr key={`${inv.item || "item"}_${i}`}>
                  <td>{i + 1}</td>
                  <td>{inv.item || "N/A"}</td>
                  <td>₹{unitPrice.toFixed(2)}</td>
                  <td>{purchased}</td>
                  <td>{sold}</td>
                  <td
                    className={`fw-bold ${
                      inStock > 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {inStock}
                  </td>
                  <td>₹{totalValue.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${inv.item}?`
                          )
                        ) {
                          deleteStockItem(inv.item);
                        }
                      }}
                    >
                      ❌ Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentStock;
