import React, { useContext, useState } from "react";
import { InventoryContext } from "../context/InventoryContext";

export default function Purchases() {
  // const { purchases, addPurchase } = useContext(InventoryContext);
  const { purchases, addPurchase, deletePurchase } = useContext(InventoryContext);

  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState(""); // per unit cost
  const [search, setSearch] = useState("");
  const [filterMin, setFilterMin] = useState("");
  const [filterMax, setFilterMax] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplier || !item || !cost || !quantity) return;

    addPurchase({
      supplier: supplier.trim(),
      item: item.trim(),
      cost: parseFloat(cost), // ✅ yahan cost bhejna hai
      quantity: parseInt(quantity),
    });

    setSupplier("");
    setItem("");
    setQuantity("");
    setCost("");
  };

  // Filtered Data
  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.supplier.toLowerCase().includes(search.toLowerCase()) ||
      p.item.toLowerCase().includes(search.toLowerCase());
    const withinRange =
      (!filterMin || p.totalCost >= parseFloat(filterMin)) &&
      (!filterMax || p.totalCost <= parseFloat(filterMax));
    return matchesSearch && withinRange;
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📦 Purchase Management</h2>

      {/* Add Purchase Form */}
      <form onSubmit={handleSubmit} className="row g-2 mb-4">
        <div className="col-md">
          <input
            type="text"
            className="form-control"
            placeholder="Supplier Name"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="text"
            className="form-control"
            placeholder="Item"
            value={item}
            onChange={(e) => setItem(e.target.value)}
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
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Cost per Unit"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-primary px-4">
            ➕ Add Purchase
          </button>
        </div>
      </form>

      {/* Search + Filter */}
      <div className="row g-2 mb-3">
        <div className="col-md">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by Supplier or Item"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Min Total Cost"
            value={filterMin}
            onChange={(e) => setFilterMin(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Max Total Cost"
            value={filterMax}
            onChange={(e) => setFilterMax(e.target.value)}
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>No.</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price (₹)</th>
              <th>Total Cost (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length > 0 ? (
              <>
                {filteredPurchases.map((p, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{p.date}</td>
                    <td>{p.supplier}</td>
                    <td>{p.item}</td>
                    <td>{p.quantity}</td>
                    <td>₹{p.cost}</td>
                    <td className="fw-bold text-danger">₹{p.totalCost}</td>
                    <td>
                      <button
                        onClick={() => deletePurchase(p.id)} // ✅ correct
                        className="btn btn-sm btn-danger"
                      >
                        ❌ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No purchases found 🚫
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
