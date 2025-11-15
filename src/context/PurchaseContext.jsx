// src/context/PurchaseContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";

export const PurchaseContext = createContext();

export const PurchaseProvider = ({ children }) => {
  // =====================================================
  //               LOAD FROM LOCAL STORAGE
  // =====================================================

  const safeLoad = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : fallback;
      return Array.isArray(fallback) && !Array.isArray(data) ? fallback : data;
    } catch {
      return fallback;
    }
  };

  const [purchases, setPurchases] = useState(() =>
    safeLoad("purchases", [])
  );

  const [purchaseCart, setPurchaseCart] = useState([]);

  const [lastSellingPrices, setLastSellingPrices] = useState(() =>
    safeLoad("lastSellingPrices", {})
  );

  const [currentSupplier, setCurrentSupplier] = useState("");

  const [products, setProducts] = useState(() =>
    safeLoad("retail_inventory", [])
  );

  // Save products automatically
  useEffect(() => {
    localStorage.setItem("retail_inventory", JSON.stringify(products));
  }, [products]);

  // Normalize names
  const normalizeKey = (s) => (s || "").trim().toLowerCase();

  // =====================================================
  //               ADD TO PURCHASE CART
  // =====================================================

  const addToPurchaseCart = (data) => {
    const qty = parseFloat(data.quantity) || 0;
    const buy = parseFloat(data.buyingPrice) || 0;
    const sellClean = data.sellingPrice !== undefined ? parseFloat(data.sellingPrice) : null;

    const key = normalizeKey(data.item);

    const sellingPrice = sellClean || lastSellingPrices[key] || 0;

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
        item: (data.item || "").trim(),
        quantity: qty,
        buyingPrice: buy,
        sellingPrice,
        totalCost: qty * buy,
        image: data.imageBase64 || "",
      },
    ]);

    if (data.supplier) setCurrentSupplier(data.supplier.trim());
  };

  // =====================================================
  //             COMPLETE PURCHASE (multiple items)
  // =====================================================

  const completePurchase = (supplier) => {
    if (purchaseCart.length === 0) return;

    const finalSupplier =
      (supplier || currentSupplier || "Unknown Supplier").trim();

    const totalCost = purchaseCart.reduce(
      (sum, itm) => sum + (parseFloat(itm.totalCost) || 0),
      0
    );

    const newEntry = {
      id: Date.now() + Math.random(),
      supplier: finalSupplier,
      items: purchaseCart,
      totalCost,
      date: new Date().toLocaleString(),
    };

    // Save purchase (latest on top)
    setPurchases((prev) => [newEntry, ...prev]);

    // Update stock in retail inventory
    purchaseCart.forEach((itm) =>
      addOrUpdateProduct({
        name: itm.item,
        stock: itm.quantity,
        sellingPrice: itm.sellingPrice,
        image: itm.image,
      })
    );

    setPurchaseCart([]);
  };

  const clearPurchaseCart = () => setPurchaseCart([]);

  // =====================================================
  //          ADD SINGLE PURCHASE (quick entry)
  // =====================================================

  const addPurchase = ({
    supplier,
    item,
    quantity,
    buyingPrice,
    sellingPrice,
    imageBase64,
  }) => {
    const qty = parseFloat(quantity) || 0;
    const buy = parseFloat(buyingPrice) || 0;
    const key = normalizeKey(item);

    const sell =
      sellingPrice !== undefined ? parseFloat(sellingPrice) : lastSellingPrices[key] || 0;

    if (sell) {
      setLastSellingPrices((prev) => ({
        ...prev,
        [key]: sell,
      }));
    }

    const newEntry = {
      id: Date.now() + Math.random(),
      supplier: (supplier || currentSupplier || "Unknown Supplier").trim(),
      items: [
        {
          id: Date.now() + Math.random(),
          item: (item || "").trim(),
          quantity: qty,
          buyingPrice: buy,
          sellingPrice: sell,
          totalCost: qty * buy,
          image: imageBase64 || "",
        },
      ],
      totalCost: qty * buy,
      date: new Date().toLocaleString(),
    };

    setPurchases((prev) => [newEntry, ...prev]);

    // Update stock
    addOrUpdateProduct({
      name: item,
      stock: qty,
      sellingPrice: sell,
      image: imageBase64 || "",
    });

    if (supplier) setCurrentSupplier(supplier.trim());
  };

  // =====================================================
  //                DELETE PURCHASE
  // =====================================================

  const deletePurchase = (id) => {
    if (window.confirm("Delete this purchase?")) {
      setPurchases((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // =====================================================
  //          GET ALL PURCHASED ITEMS (flat)
  // =====================================================

  const getPurchasedItems = () =>
    purchases.flatMap((entry) =>
      entry.items.map((i) => ({
        ...i,
        supplier: entry.supplier,
        date: entry.date,
      }))
    );

  // =====================================================
  //          TOTAL PURCHASE AMOUNT
  // =====================================================

  const getTotalPurchaseAmount = () =>
    purchases.reduce((sum, p) => sum + (parseFloat(p.totalCost) || 0), 0);

  // =====================================================
  //          ADD OR UPDATE PRODUCT (Option A)
  // =====================================================

  const addOrUpdateProduct = (product) => {
    setProducts((prev) => {
      const idx = prev.findIndex(
        (p) => normalizeKey(p.name) === normalizeKey(product.name)
      );

      if (idx >= 0) {
        const updated = [...prev];

        updated[idx] = {
          ...updated[idx],
          ...product,
          stock:
            (updated[idx].stock || 0) +
            (parseFloat(product.stock) || 0), // ➜ Stock Add hoga
        };

        return updated;
      }

      // Add new product
      return [
        ...prev,
        {
          id: Date.now() + Math.random(),
          name: product.name,
          stock: parseFloat(product.stock) || 0,
          sellingPrice: parseFloat(product.sellingPrice) || 0,
          image: product.image || "",
        },
      ];
    });
  };

  // =====================================================
  //            SAVE TO LOCAL STORAGE
  // =====================================================

  useEffect(() => {
    localStorage.setItem("purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(
      "lastSellingPrices",
      JSON.stringify(lastSellingPrices)
    );
  }, [lastSellingPrices]);

  // =====================================================
  //               RETURN PROVIDER
  // =====================================================

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

        // selling price memory
        lastSellingPrices,
        sellingPriceHistory: lastSellingPrices,
        setLastSellingPrices,

        // supplier
        currentSupplier,
        setCurrentSupplier,

        // retail inventory
        products,
        setProducts,
        addOrUpdateProduct,
        setPurchaseCart,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => useContext(PurchaseContext);
