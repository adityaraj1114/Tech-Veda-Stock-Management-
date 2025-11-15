// src/context/InventoryContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  // -------------------- LOAD STATES FROM LOCAL STORAGE --------------------
  const load = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  const [purchases, setPurchases] = useState(() => load("purchases", []));
  const [sales, setSales] = useState(() => load("sales", []));
  const [customers, setCustomers] = useState(() => load("customers", []));
  const [products, setProducts] = useState(() => load("products", []));

  // ============================================================
  // 🔥 PRODUCT MANAGEMENT (Add / Update / Delete)
  // ============================================================
  const addOrUpdateProduct = (product) => {
    setProducts((prev) => {
      const existingIndex = prev.findIndex(
        (p) => p.name.trim().toLowerCase() === product.name.trim().toLowerCase()
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...product,
        };
        return updated;
      }

      return [...prev, { id: Date.now().toString(), ...product }];
    });
  };

  const deleteProduct = (productId) => {
    if (!window.confirm("Delete this product permanently?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // ============================================================
  // 🔥 ADD SALE (Retail Sale)
  // ============================================================
  const addSale = (customer, contactPhone, items, paidAmount = 0) => {
    const totalAmount = items.reduce((s, it) => s + it.total, 0);

    const newSale = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      customer,
      contactPhone,
      items,
      totalAmount,
      paidAmount,
    };

    setSales((prev) => [...prev, newSale]);

    // 🟢 Update Product Stock (Retail Sale ↓)
    setProducts((prev) =>
      prev.map((p) => {
        const sold = items.find((it) => it.product === p.name);
        if (!sold) return p;
        return { ...p, stock: Math.max((p.stock || 0) - sold.quantity, 0) };
      })
    );

    // 🟢 Customer Ledger Update
    setCustomers((prev) => {
      const found = prev.find(
        (c) =>
          c.name.toLowerCase() === customer.toLowerCase() &&
          (c.contactPhone || "") === (contactPhone || "")
      );

      if (found) {
        return prev.map((c) =>
          c.id === found.id
            ? {
                ...c,
                paidAmount: (c.paidAmount || 0) + paidAmount,
                pendingAmount:
                  (c.pendingAmount || 0) + (totalAmount - paidAmount),
              }
            : c
        );
      } else {
        return [
          ...prev,
          {
            id: Date.now().toString(),
            name: customer,
            contactPhone,
            billingAddress: "",
            shippingAddress: "",
            gstin: "",
            paidAmount,
            pendingAmount: totalAmount - paidAmount,
          },
        ];
      }
    });
  };

  // ============================================================
  // 🔥 RECORD CUSTOMER PAYMENT
  // ============================================================
  const recordPayment = (customerId, amount) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              paidAmount: (c.paidAmount || 0) + amount,
              pendingAmount: Math.max((c.pendingAmount || 0) - amount, 0),
            }
          : c
      )
    );
  };

  // ============================================================
  // 🔥 DELETE STOCK ITEM EVERYWHERE
  // ============================================================
  const deleteStockItem = (itemName) => {
    if (!window.confirm(`Delete all purchase & sale data for "${itemName}"?`))
      return;

    setPurchases((prev) =>
      prev
        .map((p) => ({
          ...p,
          items: (p.items || []).filter((it) => it.item !== itemName),
        }))
        .filter((p) => p.items.length > 0)
    );

    setSales((prev) =>
      prev.map((s) => ({
        ...s,
        items: (s.items || []).filter((it) => it.product !== itemName),
      }))
    );

    setProducts((prev) => prev.filter((p) => p.name !== itemName));
  };

  // ============================================================
  // 🔥 RESET ALL DATA
  // ============================================================
  const resetData = () => {
    if (!window.confirm("This will delete all data permanently!")) return;

    setSales([]);
    setPurchases([]);
    setCustomers([]);
    setProducts([]);

    localStorage.removeItem("sales");
    localStorage.removeItem("purchases");
    localStorage.removeItem("customers");
    localStorage.removeItem("products");
  };

  // ============================================================
  // 🔥 INVENTORY CALCULATOR
  // ============================================================
  const getInventory = () => {
    const stockMap = {};

    // PURCHASE STOCK
    purchases.forEach((p) =>
      (p.items || []).forEach((it) => {
        if (!stockMap[it.item]) {
          stockMap[it.item] = {
            purchased: 0,
            sold: 0,
            costSum: 0,
            sellingPrice: 0,
          };
        }

        const qty = Number(it.quantity) || 0;
        const buy = Number(it.buyingPrice) || 0;
        const sell = Number(it.sellingPrice) || 0;

        stockMap[it.item].purchased += qty;
        stockMap[it.item].costSum += buy * qty;
        if (sell > 0) stockMap[it.item].sellingPrice = sell;
      })
    );

    // SALES STOCK
    sales.forEach((s) =>
      (s.items || []).forEach((it) => {
        if (!stockMap[it.product]) {
          stockMap[it.product] = {
            purchased: 0,
            sold: 0,
            costSum: 0,
            sellingPrice: 0,
          };
        }
        stockMap[it.product].sold += Number(it.quantity) || 0;
      })
    );

    return Object.entries(stockMap).map(([item, data]) => {
      const buyingPrice =
        data.purchased > 0 ? data.costSum / data.purchased : 0;
      const inStock = data.purchased - data.sold;
      const totalValue = buyingPrice * inStock;

      const productData = products.find((p) => p.name === item);
      const image = productData?.image || "";

      return {
        item,
        purchased: data.purchased,
        sold: data.sold,
        buyingPrice,
        sellingPrice:
          data.sellingPrice || productData?.sellingPrice || 0,
        inStock,
        totalValue,
        image,
      };
    });
  };

  // ============================================================
  // 🔥 PROFIT & LOSS SUMMARY
  // ============================================================
  const getProfitLoss = () => {
    const totalPurchase = purchases.reduce(
      (s, p) => s + (p.totalCost || 0),
      0
    );
    const totalSales = sales.reduce((s, p) => s + (p.totalAmount || 0), 0);
    return { totalPurchase, totalSales, profit: totalSales - totalPurchase };
  };

  // ============================================================
  // 🔥 TRANSACTIONS
  // ============================================================
  const getTransactions = () => {
    const combined = [
      ...purchases.flatMap((p) =>
        (p.items || []).map((it) => ({
          id: p.id + "_" + it.item,
          date: p.date,
          type: "Purchase",
          details: `${p.supplier} supplied ${it.quantity} × ${it.item}`,
          amount: it.totalCost,
        }))
      ),
      ...sales.map((s) => ({
        id: s.id,
        date: s.date,
        type: "Sale",
        details: `${s.customer} bought ${s.items.length} items`,
        amount: s.totalAmount,
      })),
    ];

    return combined.sort((a, b) => b.date.localeCompare(a.date));
  };

  // ============================================================
  // 🔥 SAVE TO LOCAL STORAGE
  // ============================================================
  const save = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

  useEffect(() => save("purchases", purchases), [purchases]);
  useEffect(() => save("sales", sales), [sales]);
  useEffect(() => save("customers", customers), [customers]);
  useEffect(() => save("products", products), [products]);

  // ============================================================
  // 🔥 EXPORT
  // ============================================================
  return (
    <InventoryContext.Provider
      value={{
        purchases,
        sales,
        customers,
        products,

        setPurchases,
        setSales,
        setCustomers,
        setProducts,

        addOrUpdateProduct,
        deleteProduct,

        addSale,
        recordPayment,

        getInventory,
        getProfitLoss,
        getTransactions,

        deleteStockItem,
        resetData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
