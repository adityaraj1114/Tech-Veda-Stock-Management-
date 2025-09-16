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

    const totalSaleAmount = saleData.items.reduce(
      (sum, it) => sum + (it.total ?? ((it.qty ?? it.quantity) * (it.price ?? it.unitPrice))),
      0
    );
    const paid = parseFloat(saleData.paid || 0);

    const entries = saleData.items.map((it) => {
      const itemTotal = it.total ?? ((it.qty ?? it.quantity) * (it.price ?? it.unitPrice));
      const itemPaid = totalSaleAmount ? (itemTotal / totalSaleAmount) * paid : 0;

      return {
        id: Date.now() + Math.random(),
        customer: saleData.customer.trim(),
        customerInfo: { ...saleData.customerInfo },
        product: it.product.trim(),
        quantity: it.qty ?? it.quantity,
        unitPrice: it.price ?? it.unitPrice,
        total: itemTotal,
        paid: parseFloat(itemPaid.toFixed(2)),
        pending: parseFloat((itemTotal - itemPaid).toFixed(2)),
        date: saleData.date || new Date().toLocaleString(),
      };
    });

    setSales((prev) => [...prev, ...entries]);

    updateCustomerLedger(saleData.customer, paid);
  };

  // -------------------- Update Payment --------------------
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
