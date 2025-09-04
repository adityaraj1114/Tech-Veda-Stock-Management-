import React, { useState } from "react";
import { useInventory } from "../context/InventoryContext";

export default function Purchases() {
  const {
    purchases,
    purchaseCart,
    addToPurchaseCart,
    completePurchase,
    deletePurchase,
  } = useInventory();

  const [supplier, setSupplier] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null); // for view modal

  // Add item to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!supplier || !item || !quantity || !cost) return;

    addToPurchaseCart({ item, quantity, cost });

    setItem("");
    setQuantity("");
    setCost("");
  };

  // Complete purchase
  const handleCompletePurchase = () => {
    if (!supplier || purchaseCart.length === 0) return;
    completePurchase(supplier);
    setSupplier("");
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📦 Purchase Management</h2>

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
              {purchaseCart.map((p) => (
                <tr key={p.id}>
                  <td>{p.item}</td>
                  <td>{p.quantity}</td>
                  <td>₹{p.cost}</td>
                  <td className="fw-bold">₹{p.totalCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="btn btn-success"
            onClick={handleCompletePurchase}
          >
            ✅ Buy
          </button>
        </div>
      )}

      {/* Purchases Table */}
      <div className="table-responsive">
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
            {purchases.length > 0 ? (
              purchases
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
                        className="btn btn-sm btn-info me-2"
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
                <td colSpan="5" className="text-center text-muted">
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
                    {selectedPurchase.items.map((it) => (
                      <tr key={it.id}>
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
