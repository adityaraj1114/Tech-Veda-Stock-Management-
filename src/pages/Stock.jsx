import React, { useState } from "react";
import CurrentStock from "../components/CurrentStock";

const Stock = () => {
  const [tempStock, setTempStock] = useState([]);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saleItem, setSaleItem] = useState("");
  const [saleQty, setSaleQty] = useState("");

  const capitalizeWords = (str) =>
    str
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const handleAddStock = (e) => {
    e.preventDefault();
    if (!itemName || !quantity) return;

    const formattedItem = capitalizeWords(itemName);
    const existing = tempStock.find((s) => s.item === formattedItem);

    if (existing) {
      existing.quantity += parseInt(quantity);
      setTempStock([...tempStock]);
    } else {
      setTempStock([
        ...tempStock,
        { item: formattedItem, quantity: parseInt(quantity) },
      ]);
    }

    setItemName("");
    setQuantity("");
  };

  const handleSale = (e) => {
    e.preventDefault();
    if (!saleItem || !saleQty) return;

    const formattedSaleItem = capitalizeWords(saleItem);
    const index = tempStock.findIndex((s) => s.item === formattedSaleItem);

    if (index !== -1 && tempStock[index].quantity >= parseInt(saleQty)) {
      tempStock[index].quantity -= parseInt(saleQty);
      setTempStock([...tempStock]);
    } else {
      alert("Not enough stock available for sale.");
    }

    setSaleItem("");
    setSaleQty("");
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📦 Stock Management</h2>

      {/* Add Temporary Stock */}
      <form onSubmit={handleAddStock} className="row g-2 mb-4">
        <div className="col-md">
          <input
            type="text"
            className="form-control"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-success px-4">
            ➕ Add Stock
          </button>
        </div>
      </form>

      {/* Sale Entry */}
      <form onSubmit={handleSale} className="row g-2 mb-4">
        <div className="col-md">
          <input
            type="text"
            className="form-control"
            placeholder="Item to Sell"
            value={saleItem}
            onChange={(e) => setSaleItem(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Quantity to Sell"
            value={saleQty}
            onChange={(e) => setSaleQty(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-warning px-4">
            🛒 Sell Item
          </button>
        </div>
      </form>

      {/* Temporary Stock Table */}
      <div className="table-responsive mb-5">
        <h5>🧪 Temporary Stock</h5>
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>No.</th>
              <th>Item</th>
              <th>Available Quantity</th>
            </tr>
          </thead>
          <tbody>
            {tempStock.length > 0 ? (
              tempStock.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{s.item}</td>
                  <td>{s.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-muted">
                  No temporary stock added 🚫
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Current Stock from Context */}
      <CurrentStock />
    </div>
  );
};

export default Stock;
