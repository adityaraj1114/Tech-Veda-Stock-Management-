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

  // ✅ Maintain last entered selling price per item
  const [lastSellingPrices, setLastSellingPrices] = useState(() => {
    try {
      const raw = localStorage.getItem("lastSellingPrices");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // ✅ Supplier ko memory me rakhne ke liye
  const [currentSupplier, setCurrentSupplier] = useState("");

  const normalizeKey = (s) => (s || "").toString().trim().toLowerCase();

  // -------------------- Purchase Cart --------------------
  const addToPurchaseCart = (itemData) => {
    const quantity = parseFloat(itemData.quantity) || 0;
    const buyingPrice = parseFloat(itemData.buyingPrice) || 0;
    const key = normalizeKey(itemData.item);

    // Selling price: optional, fallback to last saved
    const sellingPrice =
      itemData.sellingPrice !== undefined && itemData.sellingPrice !== null
        ? parseFloat(itemData.sellingPrice)
        : lastSellingPrices[key] || 0;

    // Save/update selling price for this item
    if (sellingPrice) {
      setLastSellingPrices((prev) => ({
        ...prev,
        [key]: sellingPrice,
      }));
    }

    setPurchaseCart((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        item: (itemData.item || "").trim(),
        quantity,
        buyingPrice,
        sellingPrice,
        totalCost: quantity * buyingPrice,
      },
    ]);

    // ✅ Update supplier
    if (itemData.supplier) setCurrentSupplier(itemData.supplier.trim());
  };

  const completePurchase = (supplier) => {
    if (purchaseCart.length === 0) return;

    const totalCost = purchaseCart.reduce(
      (sum, i) => sum + (parseFloat(i.totalCost) || 0),
      0
    );

    const newPurchase = {
      id: Date.now() + Math.random(),
      supplier: (supplier || currentSupplier || "Unknown Supplier").trim(),
      items: purchaseCart,
      totalCost,
      date: new Date().toLocaleString(),
    };

    setPurchases((prev) => [...prev, newPurchase]);
    setPurchaseCart([]);
  };

  const clearPurchaseCart = () => setPurchaseCart([]);

  const addPurchase = ({ supplier, item, quantity, buyingPrice, sellingPrice }) => {
    const qty = parseFloat(quantity) || 0;
    const cost = parseFloat(buyingPrice) || 0;
    const key = normalizeKey(item);

    const sellPrice =
      sellingPrice !== undefined && sellingPrice !== null
        ? parseFloat(sellingPrice)
        : lastSellingPrices[key] || 0;

    if (sellPrice) {
      setLastSellingPrices((prev) => ({
        ...prev,
        [key]: sellPrice,
      }));
    }

    setPurchases((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        supplier: (supplier || currentSupplier || "Unknown Supplier").trim(),
        items: [
          {
            id: Date.now() + Math.random(),
            item: (item || "").trim(),
            quantity: qty,
            buyingPrice: cost,
            sellingPrice: sellPrice,
            totalCost: qty * cost,
          },
        ],
        totalCost: qty * cost,
        date: new Date().toLocaleString(),
      },
    ]);

    if (supplier) setCurrentSupplier(supplier.trim());
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
    purchases.reduce((sum, p) => sum + (parseFloat(p.totalCost) || 0), 0);

  // -------------------- Persist to localStorage --------------------
  useEffect(() => {
    localStorage.setItem("purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem("lastSellingPrices", JSON.stringify(lastSellingPrices));
  }, [lastSellingPrices]);

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
        getTotalPurchaseAmount,
        sellingPriceHistory: lastSellingPrices, // ✅ exported alias
        lastSellingPrices, // direct access
        setLastSellingPrices,
        setPurchaseCart,
        currentSupplier,
        setCurrentSupplier,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);
