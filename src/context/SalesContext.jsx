// src/context/SalesContext.jsx
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

  // -------------------- Add Sale --------------------
  const addSale = (saleData) => {
    if (!saleData || !saleData.items || saleData.items.length === 0) return;

    // Function to calculate row totals
    const calculateRow = (it) => {
      const qty = Number(it.qty ?? it.quantity) || 0;
      const sellingPrice = Number(it.sellingPrice ?? it.unitPrice ?? it.price) || 0;
      const discount = Number(it.discount) || 0; // %
      const gst = Number(it.gst) || 0; // %

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

    // Calculate total sale amount for proportional paid distribution
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

      // proportional paid allocation
      const itemPaid =
        totalSaleAmount > 0 ? (finalTotal / totalSaleAmount) * paid : 0;

      return {
        id: Date.now() + Math.random(),
        customer: saleData.customer?.trim() || "Unknown",
        customerInfo: { ...saleData.customerInfo },
        product: it.product?.trim() || "Unnamed",
        quantity: qty,
        sellingPrice,
        discount, // ✅ saved
        gst, // ✅ saved
        netPrice,
        discountAmt,
        gstAmt,
        total: finalTotal,
        paid: parseFloat(itemPaid.toFixed(2)),
        pending: parseFloat((finalTotal - itemPaid).toFixed(2)),
        date: saleData.date || new Date().toISOString(),
      };
    });

    // Add new sales entries (recent first)
    setSales((prev) => [...entries, ...prev]);

    // Update customer ledger
    updateCustomerLedger(saleData.customer, paid);
  };

  // -------------------- Update Sale Payment --------------------
  const updateSalePayment = (updatedSales) => {
    setSales(updatedSales);

    // Update customer ledger based on paid amounts
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
