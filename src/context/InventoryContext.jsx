// src/context/InventoryContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const InventoryContext = createContext();

// ✅ Safe JSON parse helper
const safeParse = (key) => {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Invalid data in localStorage for:", key, e);
    return [];
  }
};

export const InventoryProvider = ({ children }) => {
  // ✅ Load safely from localStorage
  const [sales, setSales] = useState(() => safeParse("sales"));
  const [purchases, setPurchases] = useState(() => safeParse("purchases"));

  // ✅ Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("purchases", JSON.stringify(purchases));
  }, [purchases]);

  // ✅ Add Purchase
  const addPurchase = ({ supplier, item, quantity, cost }) => {
    setPurchases((prev) => [
      ...prev,
      {
        id: Date.now(),
        supplier,
        item: item.trim(),
        quantity: parseInt(quantity),
        cost: parseFloat(cost),
        totalCost: parseInt(quantity) * parseFloat(cost),
        date: new Date().toLocaleString(),
      },
    ]);
  };

  // ✅ Add Sale
  const addSale = (saleData) => {
    if (saleData.items) {
      // multiple items (from cart)
      const { customer, items } = saleData;
      const salesArray = items.map((item) => ({
        id: Date.now() + Math.random(),
        customer,
        product: item.product,
        quantity: item.qty ?? item.quantity, // ✅ handle both qty/quantity
        unitPrice: item.price ?? item.unitPrice,
        totalAmount: item.total,
        date: new Date().toLocaleString(),
      }));
      setSales((prev) => [...prev, ...salesArray]);
    } else {
      // single sale
      setSales((prev) => [
        ...prev,
        {
          id: Date.now(),
          customer: saleData.customer,
          product: saleData.product,
          quantity: saleData.quantity,
          unitPrice: saleData.unitPrice,
          totalAmount: saleData.totalAmount,
          date: new Date().toLocaleString(),
        },
      ]);
    }
  };

  // ✅ Delete functions
  const deletePurchase = (id) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  const deleteSale = (id) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  // ✅ Inventory Calculation
  const getInventory = () => {
    const stock = {};

    // Purchases
    (Array.isArray(purchases) ? purchases : []).forEach((p) => {
      if (!stock[p.item]) {
        stock[p.item] = { purchased: 0, sold: 0 };
      }
      stock[p.item].purchased += p.quantity || 0;
    });

    // Sales
    (Array.isArray(sales) ? sales : []).forEach((s) => {
      if (!stock[s.product]) {
        stock[s.product] = { purchased: 0, sold: 0 };
      }
      stock[s.product].sold += s.quantity || 0;
    });

    return Object.entries(stock).map(([item, data]) => ({
      item,
      purchased: data.purchased,
      sold: data.sold,
      inStock: data.purchased - data.sold,
    }));
  };

  // ✅ Profit/Loss Calculation
  const getProfitLoss = () => {
    const totalPurchase = (Array.isArray(purchases) ? purchases : []).reduce(
      (sum, p) => sum + (p.totalCost || 0),
      0
    );
    const totalSales = (Array.isArray(sales) ? sales : []).reduce(
      (sum, s) => sum + (s.totalAmount || 0),
      0
    );
    return {
      totalPurchase,
      totalSales,
      profit: totalSales - totalPurchase,
    };
  };

  return (
    <InventoryContext.Provider
      value={{
        sales,
        purchases,
        addSale,
        addPurchase,
        deleteSale,
        deletePurchase,
        getInventory,
        getProfitLoss,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

// ✅ Export context + custom hook
export { InventoryContext };
export const useInventory = () => useContext(InventoryContext);
