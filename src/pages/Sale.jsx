import React, { useContext, useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { InventoryContext } from "../context/InventoryContext";
import CartTable from "../components/CartTable";
import ProductForm from "../components/ProductForm";
import CustomerForm from "../components/CustomerForm";

export default function Sales() {
  const { purchases, addSale } = useContext(InventoryContext);

  // ✅ Customer Info
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    billingAddress: "",
    shippingAddress: "",
    contactPerson: "",
    contactPhone: "",
    gstin: "",
  });
  const [paidAmount, setPaidAmount] = useState("");

  // ✅ Cart
  const [cart, setCart] = useState([]);
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  // ✅ Add Product to Cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product || !quantity || !price) return;

    const qty = parseInt(quantity, 10);
    const unitPrice = parseFloat(price);
    setCart((c) => [
      ...c,
      { product, quantity: qty, unitPrice, total: qty * unitPrice },
    ]);

    setProduct("");
    setQuantity("");
    setPrice("");
  };

  const removeFromCart = (i) => {
    setCart((c) => c.filter((_, idx) => idx !== i));
  };

  // ✅ Transactions (persist locally)
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // ✅ Customers (persist locally)
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem("customers");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  // ✅ Finalize Sale
  const [showBillFor, setShowBillFor] = useState(null);
  const handleFinalizeSale = () => {
    if (!customerInfo.name || cart.length === 0) {
      alert("⚠️ Please enter customer details and add products.");
      return;
    }

    const total = cart.reduce((sum, it) => sum + it.total, 0);
    const paid = parseFloat(paidAmount || 0);
    const pending = total - paid;

    const date = new Date().toLocaleString();
    const id = Date.now();

    const tx = {
      id,
      customer: customerInfo.name.trim(),
      date,
      items: cart,
      total,
      paid,
      pending,
      customerInfo,
    };

    // 1) Save transaction
    setTransactions((t) => [...t, tx]);

    // 2) Update Inventory (each product as sale)
    cart.forEach((it) =>
      addSale({
        customer: tx.customer,
        product: it.product,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalAmount: it.total,
        date,
      })
    );

    // 3) Save/Update customer in list
    setCustomers((prev) => {
      const existing = prev.find((c) => c.name === tx.customer);
      if (existing) {
        return prev.map((c) =>
          c.name === tx.customer
            ? {
                ...c,
                totalAmount: c.totalAmount + total,
                paidAmount: c.paidAmount + paid,
                pendingAmount: c.pendingAmount + pending,
              }
            : c
        );
      } else {
        return [
          ...prev,
          {
            id,
            name: tx.customer,
            totalAmount: total,
            paidAmount: paid,
            pendingAmount: pending,
          },
        ];
      }
    });

    // 4) Reset form + show bill
    setCart([]);
    setCustomerInfo({
      name: "",
      billingAddress: "",
      shippingAddress: "",
      contactPerson: "",
      contactPhone: "",
      gstin: "",
    });
    setPaidAmount("");
    setShowBillFor(id);
  };

  // ✅ Delete Transaction
  const handleDeleteTx = (txId) => {
    if (!window.confirm("Delete this transaction?")) return;
    setTransactions((t) => t.filter((tx) => tx.id !== txId));
    if (showBillFor === txId) setShowBillFor(null);
  };

  // ✅ Filters
  const [search, setSearch] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");

  const filtered = transactions.filter((tx) => {
    const matchCustomer = tx.customer
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchProduct = tx.items.some((it) =>
      it.product.toLowerCase().includes(search.toLowerCase())
    );
    const inRange =
      (!minAmt || tx.total >= parseFloat(minAmt)) &&
      (!maxAmt || tx.total <= parseFloat(maxAmt));
    return (matchCustomer || matchProduct) && inRange;
  });

  // ✅ Bill Helpers
  function shareBillOnWhatsApp(tx) {
    const text = `🧾 Bill for ${tx.customer}\nDate: ${tx.date}\n\n${tx.items
      .map(
        (it, i) =>
          `${i + 1}. ${it.product} x${it.quantity} @₹${it.unitPrice} = ₹${
            it.total
          }`
      )
      .join("\n")}\n\nTotal: ₹${tx.total}\nPaid: ₹${tx.paid}\nPending: ₹${
      tx.pending
    }`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  function downloadBillPDF(tx) {
    const el = document.getElementById(`bill_${tx.id}`);
    const opt = {
      margin: 0.5,
      filename: `Bill_${tx.customer}_${tx.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(el).save();
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">💰 Sales Management</h2>

      {/* Customer Info */}
      <CustomerForm customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} />

      {/* Paid Input */}
      <div className="mb-3">
        <input
          type="number"
          className="form-control"
          placeholder="Paid Amount"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
        />
      </div>

      {/* Product Form */}
      <ProductForm
        product={product}
        setProduct={setProduct}
        quantity={quantity}
        setQuantity={setQuantity}
        price={price}
        setPrice={setPrice}
        handleAddToCart={handleAddToCart}
      />

      {/* Cart */}
      <CartTable
        cart={cart}
        removeFromCart={removeFromCart}
        handleFinalizeSale={handleFinalizeSale}
      />

      {/* Bill Preview */}
      {showBillFor &&
        (() => {
          const tx = transactions.find((t) => t.id === showBillFor);
          if (!tx) return null;
          return (
            <>
              <div
                id={`bill_${tx.id}`}
                className="border bg-white p-4 mb-4 shadow"
                style={{ maxWidth: "800px", margin: "auto" }}
              >
                <h3 className="text-center mb-3">🧾 Invoice</h3>
                <p><b>Customer:</b> {tx.customer}</p>
                <p><b>Date:</b> {tx.date}</p>
                <p><b>Contact:</b> {tx.customerInfo.contactPhone || "-"}</p>
                <p><b>Address:</b> {tx.customerInfo.billingAddress || "-"}</p>

                <table className="table table-sm table-bordered mt-3">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tx.items.map((it, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{it.product}</td>
                        <td>{it.quantity}</td>
                        <td>₹{it.unitPrice}</td>
                        <td>₹{it.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h5 className="text-end mt-3">Total: ₹{tx.total}</h5>
                <h6 className="text-end text-success">Paid: ₹{tx.paid}</h6>
                <h6 className="text-end text-danger">Pending: ₹{tx.pending}</h6>
              </div>
              <div className="d-flex gap-2 mt-3 justify-content-center">
                <button className="btn btn-primary" onClick={() => shareBillOnWhatsApp(tx)}>
                  📲 WhatsApp
                </button>
                <button className="btn btn-secondary" onClick={() => downloadBillPDF(tx)}>
                  📄 PDF
                </button>
                <button className="btn btn-outline-dark" onClick={() => setShowBillFor(null)}>
                  ❌ Close
                </button>
              </div>
            </>
          );
        })()}

      {/* Search + Filter */}
      <div className="row g-2 mb-3 mt-5">
        <div className="col-md">
          <input
            className="form-control"
            placeholder="🔍 Search by cust or prod"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Min Amount"
            value={minAmt}
            onChange={(e) => setMinAmt(e.target.value)}
          />
        </div>
        <div className="col-md">
          <input
            type="number"
            className="form-control"
            placeholder="Max Amount"
            value={maxAmt}
            onChange={(e) => setMaxAmt(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-responsive mb-5">
        <h5>📄 Transactions</h5>
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total (₹)</th>
              <th>Paid</th>
              <th>Pending</th>
              <th>View</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No transactions found 🚫
                </td>
              </tr>
            ) : (
              filtered.map((tx, i) => (
                <tr key={tx.id}>
                  <td>{i + 1}</td>
                  <td>{tx.date}</td>
                  <td>{tx.customer}</td>
                  <td className="fw-bold">₹{tx.total}</td>
                  <td className="text-success">₹{tx.paid}</td>
                  <td className="text-danger">₹{tx.pending}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => setShowBillFor(tx.id)}
                    >
                      👁️
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteTx(tx.id)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
