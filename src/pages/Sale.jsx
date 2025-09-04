// src/pages/Sales.jsx
import React, { useContext, useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { InventoryContext } from "../context/InventoryContext";
import CartTable from "../components/CartTable";
import CustomerForm from "../components/CustomerForm";
import ProductForm from "../components/ProductForm";
import BillPreview from "../components/BillPreview";
import SaleTransactions from "../components/SaleTransactions";

export default function Sales() {
  const { addSale, getInventory, addCustomer, updateCustomer, customers } =
    useContext(InventoryContext);

  // ✅ Customer Info
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    gstin: "",
    billingAddress: "",
    contactPhone: "",
  });

  const [paidAmount, setPaidAmount] = useState("");
  const [cart, setCart] = useState([]);

  // Product form
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  // Inventory options
  const inventory = getInventory();
  const productOptions = inventory.map((p) => ({
    value: p.item,
    label: p.item,
    price: p.price || 0,
  }));

  // Add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product || !quantity || !price) return;

    const qty = parseInt(quantity, 10);
    const unitPrice = parseFloat(price);

    setCart((c) => [
      ...c,
      {
        product: product.value,
        quantity: qty,
        unitPrice,
        total: qty * unitPrice,
      },
    ]);

    setProduct(null);
    setQuantity("");
    setPrice("");
  };

  const removeFromCart = (i) => {
    setCart((c) => c.filter((_, idx) => idx !== i));
  };

  // Transactions (localStorage)
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const [showBillFor, setShowBillFor] = useState(null);

  // Finalize Sale
  const handleFinalizeSale = () => {
    if (!customerInfo.name || cart.length === 0) {
      alert("⚠️ Please enter customer details and add products.");
      return;
    }

    const total = cart.reduce((sum, it) => sum + it.total, 0);
    const paid = parseFloat(paidAmount || 0);
    const pending = total - paid;
    const date = new Date().toLocaleString();
    const id = Date.now() + Math.random();

    const tx = {
      id,
      customer: customerInfo.name.trim(),
      date,
      items: cart,
      total,
      paid,
      pending,
      customerInfo, // ✅ Save full customer details
    };

    // Save transaction locally
    setTransactions((t) => [...t, tx]);

    // Save sales in context
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

    // Update or add customer in context
    const existing = customers.find((c) => c.name === customerInfo.name);
    if (existing) {
      updateCustomer(existing.id, { ...existing, ...customerInfo });
    } else {
      addCustomer(customerInfo);
    }

    // Reset form
    setCart([]);
    setCustomerInfo({
      name: "",
      gstin: "",
      billingAddress: "",
      contactPhone: "",
    });
    setPaidAmount("");
    setShowBillFor(id);
  };

  const handleDeleteTx = (txId) => {
    if (!window.confirm("Delete this transaction?")) return;
    setTransactions((t) => t.filter((tx) => tx.id !== txId));
    if (showBillFor === txId) setShowBillFor(null);
  };

  const shareBillOnWhatsApp = (tx) => {
    const text = `🧾 Bill for ${tx.customer}
Date: ${tx.date}

${tx.items
  .map(
    (it, i) =>
      `${i + 1}. ${it.product} x${it.quantity} @₹${it.unitPrice} = ₹${it.total}`
  )
  .join("\n")}

Total: ₹${tx.total}
Paid: ₹${tx.paid}
Pending: ₹${tx.pending}

📍 Address: ${tx.customerInfo.billingAddress || "N/A"}
📞 Phone: ${tx.customerInfo.contactPhone || "N/A"}
GSTIN: ${tx.customerInfo.gstin || "N/A"}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const downloadBillPDF = (tx) => {
    const el = document.getElementById(`bill_${tx.id}`);
    const opt = {
      margin: 0.5,
      filename: `Bill_${tx.customer}_${tx.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(el).save();
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">💰 Sales Management</h2>

      {/* Customer Details */}
      <CustomerForm
        customerInfo={customerInfo}
        setCustomerInfo={setCustomerInfo}
      />

      {/* Product Selection */}
      <ProductForm
        product={product}
        setProduct={setProduct}
        quantity={quantity}
        setQuantity={setQuantity}
        price={price}
        setPrice={setPrice}
        productOptions={productOptions}
        handleAddToCart={handleAddToCart}
      />

      {/* Cart */}
      <CartTable
        cart={cart}
        removeFromCart={removeFromCart}
        handleFinalizeSale={handleFinalizeSale}
      />

      {/* Paid Amount */}
      <div className="mb-3">
        <input
          type="number"
          className="form-control"
          placeholder="Paid Amount"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
        />
      </div>

      {/* Bill Preview */}
      <BillPreview
        shareBillOnWhatsApp={shareBillOnWhatsApp}
        downloadBillPDF={downloadBillPDF}
        setShowBillFor={setShowBillFor}
        showBillFor={showBillFor}
        transactions={transactions}
        tx={transactions.find((t) => t.id === showBillFor)}
      />

      {/* Sale Transactions */}
      <SaleTransactions
        transactions={transactions}
        onView={setShowBillFor}
        onDelete={handleDeleteTx}
      />
    </div>
  );
}
