import React, { useContext, useMemo } from "react";
import { InventoryContext } from "../context/InventoryContext";
import { useSales } from "../context/SalesContext";
import { PurchaseContext } from "../context/PurchaseContext";

const CurrentStock = ({ search = "" }) => {
  const { getInventory, deleteStockItem } = useContext(InventoryContext);
  const { sales } = useSales();
  const { getPurchasedItems } = useContext(PurchaseContext);

  // Ensure inventory is always an array
  const inventory = Array.isArray(getInventory()) ? getInventory() : [];

  // ✅ Merge purchases & sales data
  const inventoryWithStock = useMemo(() => {
    const purchasedItems = getPurchasedItems();

    return inventory.map((inv) => {
      // Purchased quantity from PurchaseContext (flattened items)
      const purchasedQty = purchasedItems
        .filter((p) => p.item === inv.item)
        .reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

      // Sold quantity from SalesContext
      const soldQty = sales
        .filter((s) => s.product === inv.item)
        .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

      const inStock = purchasedQty - soldQty;
      const unitPrice = Number(inv.unitPrice) || 0;
      const totalValue = unitPrice * inStock;

      return {
        ...inv,
        purchased: purchasedQty,
        sold: soldQty,
        inStock,
        totalValue,
      };
    });
  }, [inventory, sales, getPurchasedItems]);

  // ✅ Filter by search
  const filteredInventory = inventoryWithStock.filter((inv) =>
    (inv.item || "").toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Grand Total Value of all stock
  const grandTotalValue = filteredInventory.reduce(
    (sum, inv) => sum + (inv.totalValue || 0),
    0
  );

  if (!filteredInventory.length) {
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
            {filteredInventory.map((inv, i) => (
              <tr key={`${inv.item || "item"}_${i}`}>
                <td>{i + 1}</td>
                <td>{inv.item || "N/A"}</td>
                <td>₹{(inv.unitPrice || 0).toFixed(2)}</td>
                <td>{inv.purchased || 0}</td>
                <td>{inv.sold || 0}</td>
                <td
                  className={`fw-bold ${
                    inv.inStock > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {inv.inStock}
                </td>
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

            {/* ✅ Summary Row for Grand Total */}
            <tr className="table-secondary fw-bold">
              <td colSpan="6" className="text-end">
                Grand Total Value:
              </td>
              <td colSpan="2">₹{grandTotalValue.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentStock;
