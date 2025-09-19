import React, { useState, useEffect } from "react";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import { useCustomer } from "../context/CustomerContext";
import { useSales } from "../context/SalesContext";
import { useInventory } from "../context/InventoryContext";

import CartTable from "../components/CartTable";
import CustomerForm from "../components/CustomerForm";
import ProductForm from "../components/ProductForm";
import BillPreview from "../components/BillPreview";
import SaleTransactions from "../components/SaleTransactions";

export default function Sales() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    customerInfo,
    setCustomerInfo,
  } = useCustomer();
  const { addSale, setTotalSales } = useSales(); // ✅ assuming setTotalSales is exposed
  const { getInventory } = useInventory();

  const [paidAmount, setPaidAmount] = useState("");
  const [cart, setCart] = useState([]);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const inventory = getInventory();
  const productOptions = inventory.map((p) => ({
    value: p.item,
    label: p.item,
    price: p.price || 0,
  }));

  const handleAddToCart = (e) => {
    if (e) e.preventDefault();
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

  const removeFromCart = (i) => setCart((c) => c.filter((_, idx) => idx !== i));

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    const total = transactions.reduce((sum, tx) => sum + (tx.total || 0), 0);
    setTotalSales?.(total); // ✅ update context for dashboard
  }, [transactions, setTotalSales]);

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
    const txId = Date.now() + Math.random();

    const tx = {
      id: txId,
      customer: customerInfo.name.trim(),
      date,
      items: cart,
      total,
      paid,
      pending,
      customerInfo: { ...customerInfo },
    };
    setTransactions((t) => [...t, tx]);
    setShowBillFor(txId);

    addSale({
      customer: customerInfo.name.trim(),
      customerInfo: { ...customerInfo },
      items: cart,
      total,
      paid,
      pending,
      date,
    });

    const normalizePhone = (phone) =>
      (phone || "").replace(/\D/g, "").trim() || "NA";
    const phoneB = normalizePhone(customerInfo.contactPhone);

    const existing = customers.find((c) => {
      const sameName =
        (c.name || "").trim().toLowerCase() ===
        customerInfo.name.trim().toLowerCase();
      const phoneA = normalizePhone(c.contactPhone);

      if (phoneA === "NA" || phoneB === "NA") return sameName;
      return sameName && phoneA === phoneB;
    });

    if (existing) {
      updateCustomer(existing.id, {
        name: customerInfo.name || existing.name,
        contactPhone: customerInfo.contactPhone || existing.contactPhone,
        billingAddress: customerInfo.billingAddress || existing.billingAddress,
        shippingAddress:
          customerInfo.shippingAddress || existing.shippingAddress,
        gstin: customerInfo.gstin || existing.gstin,
        totalPurchase: (existing.totalPurchase || 0) + total,
        paidAmount: (existing.paidAmount || 0) + paid,
        pendingAmount: (existing.pendingAmount || 0) + pending,
      });
    } else {
      addCustomer({
        ...customerInfo,
        totalPurchase: total,
        paidAmount: paid,
        pendingAmount: pending,
      });
    }

    setCart([]);
    setCustomerInfo({
      name: "",
      gstin: "",
      billingAddress: "",
      shippingAddress: "",
      contactPhone: "",
    });
    setPaidAmount("");
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
📦 Shipping: ${tx.customerInfo.shippingAddress || "N/A"}
📞 Phone: ${tx.customerInfo.contactPhone || "N/A"}
GSTIN: ${tx.customerInfo.gstin || "N/A"}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const downloadBillPDF = (tx) => {
    const el = document.getElementById(`bill_${tx.id}`);
    if (!el) return;
    const opt = {
      margin: 0.5,
      filename: `Bill_${tx.customer}_${tx.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(el).save().catch((err) => console.error(err));
  };

  // ✅ Total Sales Calculation
  const totalSales = transactions.reduce((sum, tx) => sum + (tx.total || 0), 0);

  return (
    <div className="container py-4">
      <h2 className="mb-4">💰 Sales Management</h2>

      {/* ✅ Total Sales Summary Box */}
      <div className="alert alert-info d-flex justify-content-between align-items-center">
        <strong>📊 Total Sales:</strong>
        <span className="fs-5 fw-bold text-success">₹{totalSales.toFixed(2)}</span>
      </div>

      <CustomerForm />
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

      <CartTable
        cart={cart}
        removeFromCart={removeFromCart}
        handleFinalizeSale={handleFinalizeSale}
      />

      <div className="mb-3">
        <input
          type="number"
          className="form-control"
          placeholder="Paid Amount"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
        />
      </div>

      <BillPreview
        shareBillOnWhatsApp={shareBillOnWhatsApp}
        downloadBillPDF={downloadBillPDF}
        setShowBillFor={setShowBillFor}
        showBillFor={showBillFor}
        transactions={transactions}
        // transactions={customerSales}
        tx={transactions.find((t) => t.id === showBillFor)}
      />

      <SaleTransactions
        transactions={transactions}
        onView={setShowBillFor}
        onDelete={handleDeleteTx}
      />
    </div>
  );
}
