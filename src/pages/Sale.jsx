import React, { useContext, useState } from "react";
import { InventoryContext } from "../context/InventoryContext";

export default function Sales() {
  // const { sales, purchases, addSale } = useContext(InventoryContext);
  const { sales, purchases, addSale, deleteSale } =
    useContext(InventoryContext);

  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(""); // per unit selling price
  const [search, setSearch] = useState("");
  const [filterMin, setFilterMin] = useState("");
  const [filterMax, setFilterMax] = useState("");

  // 🔽 Unique products list from purchases
  const uniqueProducts = [
    ...new Set(purchases.map((p) => p.item.trim().toLowerCase())),
  ];

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!customer || !product || !quantity || !price) return;

    const total = parseFloat(price) * parseInt(quantity);

    setCart([
      ...cart,
      {
        product: product.trim(),
        quantity: parseInt(quantity),
        unitPrice: parseFloat(price),
        total,
      },
    ]);

    setProduct("");
    setQuantity("");
    setPrice("");
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer || !product || !quantity || !price) return;

    const totalAmount = parseFloat(price) * parseInt(quantity);

    addSale({
      customer: customer.trim(),
      product: product.trim(),
      quantity: parseInt(quantity),
      unitPrice: parseFloat(price),
      totalAmount,
      date: new Date().toLocaleDateString(),
    });

    setCustomer("");
    setProduct("");
    setQuantity("");
    setPrice("");
  };

  const handleFinalizeSale = () => {
  if (cart.length === 0 || !customer) return;

  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);

  // Add Sale in Sales Context
  addSale({
    customer,
    items: cart,
    grandTotal,
    date: new Date().toLocaleDateString(),
  });

  // 🔽 Update Customers in LocalStorage
  const storedCustomers = JSON.parse(localStorage.getItem("customers")) || [];
  const existing = storedCustomers.find(
    (c) => c.customerName.toLowerCase() === customer.toLowerCase()
  );

  if (existing) {
    // Update existing customer
    existing.products.push(...cart);
    existing.totalAmount += grandTotal;
    existing.pendingAmount += grandTotal; // initially unpaid
  } else {
    // New customer entry
    storedCustomers.push({
      id: Date.now(),
      customerName: customer,
      products: cart,
      totalAmount: grandTotal,
      paidAmount: 0,
      pendingAmount: grandTotal,
    });
  }

  localStorage.setItem("customers", JSON.stringify(storedCustomers));

  // Reset Cart
  setCart([]);
  setCustomer("");
};


  const generateBillText = () => {
    let bill = `🧾 Bill for ${customer}\n\n`;
    cart.forEach((item, i) => {
      bill += `${i + 1}. ${item.product} x${item.quantity} @₹${
        item.unitPrice
      } = ₹${item.total}\n`;
    });
    bill += `\nTOTAL = ₹${cart.reduce((sum, item) => sum + item.total, 0)}`;
    return bill;
  };

  const shareOnWhatsApp = () => {
    const billText = generateBillText();
    const url = `https://wa.me/?text=${encodeURIComponent(billText)}`;
    window.open(url, "_blank");
  };

  // 🔍 Filtered Data
  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.customer.toLowerCase().includes(search.toLowerCase()) ||
      s.product.toLowerCase().includes(search.toLowerCase());
    const withinRange =
      (!filterMin || s.totalAmount >= parseFloat(filterMin)) &&
      (!filterMax || s.totalAmount <= parseFloat(filterMax));
    return matchesSearch && withinRange;
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-4">💰 Sales Management</h2>

      {/* Add to Cart Form */}
      <form onSubmit={handleAddToCart} className="row g-2 mb-4">
        <div className="col-md">
          <input
            type="text"
            className="form-control"
            placeholder="Customer Name"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
        </div>
        <div className="col-md">
          <select
            className="form-control"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          >
            <option value="">-- Select Product --</option>
            {uniqueProducts.map((prod, i) => (
              <option key={i} value={prod}>
                {prod}
              </option>
            ))}
          </select>
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
            placeholder="Price per Unit"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-warning px-4">
            ➕ Add to Cart
          </button>
        </div>
      </form>

      {/* Cart Table */}
      {cart.length > 0 && (
        <div className="mb-3">
          <h5>🛒 Cart</h5>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item.product}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.unitPrice}</td>
                  <td>₹{item.total}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeFromCart(i)}
                    >
                      ❌ Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex gap-2">
            <button onClick={handleFinalizeSale} className="btn btn-success">
              ✅ Finalize Sale
            </button>
            <button onClick={shareOnWhatsApp} className="btn btn-primary">
              📲 Share on WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="row g-2 mb-3">
        <div className="col-md">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search by Customer or Product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Min Total Amount"
            value={filterMin}
            onChange={(e) => setFilterMin(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Max Total Amount"
            value={filterMax}
            onChange={(e) => setFilterMax(e.target.value)}
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price (₹)</th>
              <th>Total Amount (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.date}</td>
                <td>{s.customer}</td>
                <td>{s.product}</td>
                <td>{s.quantity}</td>
                <td>₹{s.unitPrice}</td>
                <td className="fw-bold text-success">₹{s.totalAmount}</td>
                <td>
                  <button
                    onClick={() => deleteSale(s.id)}
                    className="btn btn-sm btn-danger"
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
}
