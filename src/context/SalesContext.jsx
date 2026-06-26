import React, { createContext, useContext, useState, useEffect } from "react";
import { useCustomer } from "./CustomerContext";

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const { updateCustomerLedger } = useCustomer();

  // -------------------- Load Sales --------------------
  const [sales, setSales] = useState(() => {
    try {
      const raw = localStorage.getItem("sales");
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data)
        ? data.sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];
    } catch {
      return [];
    }
  });

  // ✅ Format date as DD/MM/YYYY HH:mm:ss
  const formatDate = (d) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // -------------------- Add Sale --------------------
  const addSale = (saleData) => {
    if (!saleData || !saleData.items || saleData.items.length === 0) return;

    // ✅ FIX: customerName properly define kiya
    const customerName =
      saleData.customer?.trim() ||
      saleData.customerInfo?.name?.trim() ||
      "Unknown";

    const calculateRow = (it) => {
      const qty = Number(it.qty ?? it.quantity) || 0;
      const sellingPrice =
        Number(it.sellingPrice ?? it.unitPrice ?? it.price) || 0;
      const discount = Number(it.discount) || 0;
      const gst = Number(it.gst) || 0;

      const netPrice = qty * sellingPrice;
      const discountAmt = (discount / 100) * netPrice;
      const afterDiscount = netPrice - discountAmt;
      const gstAmt = (gst / 100) * afterDiscount;
      const finalTotal = afterDiscount + gstAmt;

      return {
        qty,
        sellingPrice,
        discount,
        gst,
        netPrice,
        discountAmt,
        gstAmt,
        finalTotal,
      };
    };

    const totalSaleAmount = saleData.items.reduce(
      (sum, it) => sum + calculateRow(it).finalTotal,
      0
    );

    const paid = parseFloat(saleData.paid || 0);

    const entries = saleData.items.map((it) => {
      const {
        qty,
        sellingPrice,
        discount,
        gst,
        netPrice,
        discountAmt,
        gstAmt,
        finalTotal,
      } = calculateRow(it);

      const itemPaid =
        totalSaleAmount > 0 ? (finalTotal / totalSaleAmount) * paid : 0;

      return {
        id: Date.now() + Math.random(),
        customer: customerName,
        customerInfo: { ...saleData.customerInfo },
        product: it.product?.trim() || "Unnamed",
        quantity: qty,
        sellingPrice,
        discount,
        gst,
        netPrice,
        discountAmt,
        gstAmt,
        total: finalTotal,
        paid: parseFloat(itemPaid.toFixed(2)),
        pending: parseFloat((finalTotal - itemPaid).toFixed(2)),
        date: saleData.date || formatDate(new Date()),
      };
    });

    // ✅ Add new sales entries (latest first)
    setSales((prev) => [...entries, ...prev]);

    // ✅ FIX: customerName ab properly pass ho raha hai
    updateCustomerLedger(customerName, {
      totalPurchase: totalSaleAmount,
      paidAmount: paid,
      pendingAmount: totalSaleAmount - paid,
    }, {
      contactPhone: saleData.customerInfo?.contactPhone || "",
      billingAddress: saleData.customerInfo?.billingAddress || "",
      shippingAddress: saleData.customerInfo?.shippingAddress || "",
      gstin: saleData.customerInfo?.gstin || "",
    });
  };

  // -------------------- Update Sale Payment --------------------
  const updateSalePayment = (updatedSales) => {
    const sorted = [...updatedSales].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setSales(sorted);
  };

  // -------------------- Persist to localStorage --------------------
  useEffect(() => {
    const sorted = [...sales].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    localStorage.setItem("sales", JSON.stringify(sorted));
  }, [sales]);

  return (
    <SalesContext.Provider value={{ sales, addSale, updateSalePayment }}>
      {children}
    </SalesContext.Provider>
  );
};

// -------------------- Hook --------------------
export const useSales = () => useContext(SalesContext);
