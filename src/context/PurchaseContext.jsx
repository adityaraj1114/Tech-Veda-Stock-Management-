// src/context/PurchaseContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

export const PurchaseContext = createContext();

export const PurchaseProvider = ({ children }) => {
  const [purchases, setPurchases] = useState(() => {
    try {
      const raw = localStorage.getItem("purchases");
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });

  const [purchaseCart, setPurchaseCart] = useState([]);

  // -------------------- Purchase Cart --------------------
  const addToPurchaseCart = (itemData) => {
    setPurchaseCart((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        item: itemData.item.trim(),
        quantity: parseInt(itemData.quantity, 10),
        cost: parseFloat(itemData.cost),
        totalCost: parseInt(itemData.quantity, 10) * parseFloat(itemData.cost),
      },
    ]);
  };

  const completePurchase = (supplier) => {
    if (purchaseCart.length === 0) return;

    const totalCost = purchaseCart.reduce((sum, i) => sum + i.totalCost, 0);

    const newPurchase = {
      id: Date.now() + Math.random(),
      supplier: supplier.trim(),
      items: purchaseCart,
      totalCost,
      date: new Date().toLocaleString(),
    };

    setPurchases((prev) => [...prev, newPurchase]);
    setPurchaseCart([]);
  };

  const clearPurchaseCart = () => setPurchaseCart([]);

  const addPurchase = ({ supplier, item, quantity, cost }) => {
    const qty = parseInt(quantity, 10);
    const price = parseFloat(cost);

    setPurchases((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        supplier: supplier.trim(),
        items: [
          {
            id: Date.now() + Math.random(),
            item: item.trim(),
            quantity: qty,
            cost: price,
            totalCost: qty * price,
          },
        ],
        totalCost: qty * price,
        date: new Date().toLocaleString(),
      },
    ]);
  };

  const deletePurchase = (id) => {
    if (window.confirm("Delete this purchase?")) {
      setPurchases((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // -------------------- Flatten all purchased items --------------------
  const getPurchasedItems = () => {
    return purchases.flatMap((purchase) =>
      purchase.items.map((i) => ({
        ...i,
        supplier: purchase.supplier,
        date: purchase.date,
      }))
    );
  };

  // ✅ Total Purchased Amount
  const getTotalPurchaseAmount = () =>
    purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);

  // ✅ Persist to localStorage
  useEffect(() => {
    localStorage.setItem("purchases", JSON.stringify(purchases));
  }, [purchases]);

  return (
    <PurchaseContext.Provider
      value={{
        purchases,
        purchaseCart,
        addToPurchaseCart,
        completePurchase,
        clearPurchaseCart,
        addPurchase,
        deletePurchase,
        getPurchasedItems,
        getTotalPurchaseAmount, // ✅ exposed
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);
