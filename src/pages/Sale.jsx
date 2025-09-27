// src/pages/Sales.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import { useCustomer } from "../context/CustomerContext";
import { useSales } from "../context/SalesContext";
import { useInventory } from "../context/InventoryContext";
import { useProfile } from "../context/ProfileContext";

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
  const { addSale, setTotalSales } = useSales();
  const { getInventory } = useInventory();
  const { profile } = useProfile();

  // payment / cart / product states
  const [paidAmount, setPaidAmount] = useState("");
  const [cart, setCart] = useState([]);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState(""); // % per-item (optional)
  const [gst, setGst] = useState(""); // % per-item (optional; fallback to profile.gstPercent)

  // inventory -> productOptions for react-select
  const inventory = getInventory();
  const productOptions = inventory.map((p) => ({
    value: p.item,
    label: p.item,
    // prefer explicit selling price in inventory, fallback to price/unit fields
    price: p.sellingPrice ?? p.price ?? p.unitPrice ?? p.buyingPrice ?? 0,
  }));

  // Add product to cart (computes discount + gst + final total per row)
  const handleAddToCart = (e) => {
    if (e) e.preventDefault();
    if (!product || !quantity || price === "" || price === null) return;

    const qty = Number(quantity) || 0;
    const selling = Number(price) || 0;
    const discountPct = discount === "" ? 0 : Number(discount) || 0;
    // If user didn't enter GST for this item, use profile.gstPercent (or 0)
    const gstPct =
      gst === "" || gst === null
        ? Number(profile?.gstPercent || 0)
        : Number(gst) || 0;

    const netPrice = qty * selling;
    const discountAmount = (discountPct / 100) * netPrice;
    const afterDiscount = netPrice - discountAmount;
    const gstAmount = (gstPct / 100) * afterDiscount;
    const finalTotal = afterDiscount + gstAmount;

    setCart((c) => [
      ...c,
      {
        product: product.value,
        quantity: qty,
        sellingPrice: selling,
        discount: discountPct,
        gst: gstPct,
        netPrice,
        discountAmount,
        gstAmount,
        total: Number(finalTotal.toFixed(2)),
      },
    ]);

    // reset product inputs
    setProduct(null);
    setQuantity("");
    setPrice("");
    setDiscount("");
    setGst("");
  };

  const removeFromCart = (i) => setCart((c) => c.filter((_, idx) => idx !== i));

  // Transactions stored locally
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  // persist transactions and update total sales
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    const total = transactions.reduce((sum, tx) => sum + (tx.total || 0), 0);
    setTotalSales?.(total);
  }, [transactions, setTotalSales]);

  const [showBillFor, setShowBillFor] = useState(null);

  // Finalize sale: validate, create tx, update customers & sales context
  const handleFinalizeSale = () => {
    if (!customerInfo.name || cart.length === 0) {
      alert("⚠️ Please enter customer details and add products.");
      return;
    }

    // transaction total is sum of per-item final totals (already includes discount+gst)
    const total = cart.reduce((sum, it) => sum + (it.total || 0), 0);
    const paid = parseFloat(paidAmount || 0);
    const pending = Number((total - paid).toFixed(2));
    const date = new Date().toLocaleString();
    const txId = Date.now() + Math.random();

    const tx = {
      id: txId,
      customer: customerInfo.name.trim(),
      date,
      items: cart,
      total: Number(total.toFixed(2)),
      paid: Number(paid.toFixed(2)),
      pending,
      customerInfo: { ...customerInfo },
    };

    setTransactions((t) => [...t, tx]);
    setShowBillFor(txId);

    // Send to Sales context; SalesContext handles splitting entries etc.
    addSale({
      customer: customerInfo.name.trim(),
      customerInfo: { ...customerInfo },
      items: cart,
      total,
      paid,
      pending,
      date,
    });

    // Update or create customer record (totals)
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

    // reset UI
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

  // WhatsApp share text (uses sellingPrice and per-item totals)
  const shareBillOnWhatsApp = (tx) => {
    const text = `🧾 Bill for ${tx.customer}
Date: ${tx.date}

${tx.items
      .map(
        (it, i) =>
          `${i + 1}. ${it.product} x${it.quantity} @₹${it.sellingPrice} = ₹${it.total}`
      )
      .join("\n")}

SubTotal: ₹${tx.items
      .reduce((s, it) => s + (it.netPrice || it.quantity * it.sellingPrice || 0), 0)
      .toFixed(2)}
Total: ₹${tx.total}
Paid: ₹${tx.paid}
Pending: ₹${tx.pending}

📍 Address: ${tx.customerInfo.billingAddress || "N/A"}
📦 Shipping: ${tx.customerInfo.shippingAddress || "N/A"}
📞 Phone: ${tx.customerInfo.contactPhone || "N/A"}
GSTIN: ${tx.customerInfo.gstin || "N/A"}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Download invoice PDF
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
    html2pdf()
      .set(opt)
      .from(el)
      .save()
      .catch((err) => console.error(err));
  };

  const totalSales = transactions.reduce((sum, tx) => sum + (tx.total || 0), 0);

  return (
    <div className="container py-4 pb-5">
      {/* Page Heading */}
      <motion.h2
        className="mb-4 fw-bold text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(90deg, #075a53ff, #09a344ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "1.6rem",
        }}
      >
        💰 Sales Management
      </motion.h2>

      {/* Total Sales Summary Box */}
      <motion.div
        className="p-3 mb-4 rounded-4 shadow-sm text-center text-white"
        style={{
          background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <strong className="fs-5">📊 Total Sales: </strong>
        <span className="fs-4 fw-bold ms-2">₹{totalSales.toFixed(2)}</span>
      </motion.div>

      {/* Customer Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <CustomerForm />
      </motion.div>

      {/* Product Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <ProductForm
          product={product}
          setProduct={setProduct}
          quantity={quantity}
          setQuantity={setQuantity}
          price={price}
          setPrice={setPrice}
          discount={discount}
          setDiscount={setDiscount}
          gst={gst}
          setGst={setGst}
          productOptions={productOptions}
          handleAddToCart={handleAddToCart}
        />
      </motion.div>

      {/* Cart Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <CartTable
          cart={cart}
          removeFromCart={removeFromCart}
          handleFinalizeSale={handleFinalizeSale}
        />
      </motion.div>

      {/* Paid Amount Input */}
      <motion.div className="mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <input
          type="number"
          className="form-control shadow-sm"
          placeholder="💵 Paid Amount"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
        />
      </motion.div>

      {/* Bill Preview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <BillPreview
          shareBillOnWhatsApp={shareBillOnWhatsApp}
          downloadBillPDF={downloadBillPDF}
          setShowBillFor={setShowBillFor}
          showBillFor={showBillFor}
          transactions={transactions}
          tx={transactions.find((t) => t.id === showBillFor)}
        />
      </motion.div>

      {/* Transactions Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <SaleTransactions
          transactions={transactions}
          onView={setShowBillFor}
          onDelete={handleDeleteTx}
        />
      </motion.div>
    </div>
  );
}
