// src/context/InventoryContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  // -------------------- States --------------------
  const [purchases, setPurchases] = useState(() => {
    try {
      const raw = localStorage.getItem("purchases");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [sales, setSales] = useState(() => {
    try {
      const raw = localStorage.getItem("sales");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [customers, setCustomers] = useState(() => {
    try {
      const raw = localStorage.getItem("customers");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // -------------------- Add Sale --------------------
  const addSale = (customer, contactPhone, items, paidAmount = 0) => {
    const totalAmount = items.reduce((sum, it) => sum + it.total, 0);

    const newSale = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      customer,
      contactPhone,
      items, // [{ product, quantity, sellingPrice, total }]
      totalAmount,
      paidAmount,
    };

    setSales((prev) => [...prev, newSale]);

    // ✅ Update customer record too
    setCustomers((prev) => {
      const existing = prev.find(
        (c) =>
          c.name.trim().toLowerCase() === customer.trim().toLowerCase() &&
          (c.contactPhone || "") === (contactPhone || "")
      );
      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
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

  // -------------------- Record Payment --------------------
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

  // -------------------- Delete Stock Item --------------------
  const deleteStockItem = (itemName) => {
    if (
      window.confirm(`Delete all purchase & sale records for "${itemName}"?`)
    ) {
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
    }
  };

  // -------------------- Reset All Data --------------------
  const resetData = () => {
    if (window.confirm("This will permanently delete ALL data. Continue?")) {
      setSales([]);
      setPurchases([]);
      setCustomers([]);
      localStorage.removeItem("sales");
      localStorage.removeItem("purchases");
      localStorage.removeItem("customers");
    }
  };

  // -------------------- Get Inventory --------------------
  const getInventory = () => {
  const stockMap = {};

  // Purchases → Buying Price + Selling Price
  purchases.forEach((p) => {
    (p.items || []).forEach((it) => {
      if (!stockMap[it.item]) {
        stockMap[it.item] = {
          purchased: 0,
          sold: 0,
          costSum: 0, // buying price × qty
          sellingPrice: 0, // last entered selling price
        };
      }
      const qty = Number(it.quantity) || 0;
      const buyingPrice = Number(it.buyingPrice) || 0;
      const sellingPrice = Number(it.sellingPrice) || 0;

      stockMap[it.item].purchased += qty;
      stockMap[it.item].costSum += buyingPrice * qty;
      // always update selling price with the latest one
      if (sellingPrice > 0) stockMap[it.item].sellingPrice = sellingPrice;
    });
  });

  // Sales → update sold quantity
  sales.forEach((s) => {
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
    });
  });

  // Map to inventory array
  return Object.entries(stockMap).map(([item, data]) => {
    const buyingPrice = data.purchased > 0 ? data.costSum / data.purchased : 0;
    const inStock = data.purchased - data.sold;
    const totalValue = buyingPrice * inStock; // based on buying price

    return {
      item,
      purchased: data.purchased,
      sold: data.sold,
      buyingPrice,
      sellingPrice: data.sellingPrice, // ✅ show last set selling price
      inStock,
      totalValue,
    };
  });
};


  // -------------------- Profit/Loss --------------------
  const getProfitLoss = () => {
    const totalPurchase = purchases.reduce(
      (sum, p) => sum + (p.totalCost || 0),
      0
    );
    const totalSales = sales.reduce(
      (sum, s) => sum + (s.totalAmount || 0),
      0
    );

    return { totalPurchase, totalSales, profit: totalSales - totalPurchase };
  };

  // -------------------- Transactions --------------------
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

  // -------------------- Persist --------------------
  useEffect(() => {
    localStorage.setItem("purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  return (
    <InventoryContext.Provider
      value={{
        purchases,
        sales,
        customers,
        setPurchases,
        setSales,
        setCustomers,
        getInventory,
        getProfitLoss,
        getTransactions,
        deleteStockItem,
        resetData,
        addSale,
        recordPayment,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
