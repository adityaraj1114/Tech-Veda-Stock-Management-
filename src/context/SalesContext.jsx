import React, { createContext, useContext, useState, useEffect } from "react";
import { useCustomer } from "./CustomerContext";

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState(() => {
    try {
      const raw = localStorage.getItem("sales");
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });

  const { updateCustomerLedger } = useCustomer();

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

    const calculateRow = (it) => {
      const qty = Number(it.qty ?? it.quantity) || 0;
      const sellingPrice = Number(it.sellingPrice ?? it.unitPrice ?? it.price) || 0;
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
        customer:
          saleData.customer?.trim() ||
          saleData.customerInfo?.name?.trim() ||
          "Unknown",
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

    // ✅ Update customer ledger
    updateCustomerLedger(
      saleData.customer?.trim() || saleData.customerInfo?.name?.trim() || "Unknown",
      paid
    );
  };

  // -------------------- Update Sale Payment --------------------
  const updateSalePayment = (updatedSales) => {
    setSales(updatedSales);

    const ledgerMap = {};
    updatedSales.forEach((s) => {
      if (!ledgerMap[s.customer]) ledgerMap[s.customer] = 0;
      ledgerMap[s.customer] += s.paid;
    });

    Object.keys(ledgerMap).forEach((custName) => {
      updateCustomerLedger(custName, ledgerMap[custName]);
    });
  };

  // -------------------- Persist to localStorage --------------------
  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  return (
    <SalesContext.Provider value={{ sales, addSale, updateSalePayment }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => useContext(SalesContext);
