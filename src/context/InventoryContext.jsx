import React, { createContext, useContext, useState, useEffect } from "react";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  // -------------------- STATES --------------------
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

  const [products, setProducts] = useState(() => {
    try {
      const raw = localStorage.getItem("products");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // -------------------- ADD / UPDATE PRODUCT --------------------
  const addOrUpdateProduct = (product) => {
    // product = { id?, name, buyingPrice, sellingPrice, stock, image }
    setProducts((prev) => {
      const existingIndex = prev.findIndex(
        (p) => p.name.trim().toLowerCase() === product.name.trim().toLowerCase()
      );
      if (existingIndex !== -1) {
        // update existing
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...product };
        return updated;
      } else {
        // add new
        return [...prev, { id: Date.now().toString(), ...product }];
      }
    });
  };

  // -------------------- DELETE PRODUCT --------------------
  const deleteProduct = (productId) => {
    if (window.confirm("Delete this product permanently?")) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // -------------------- ADD SALE --------------------
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

    // ✅ Update stock after sale
    setProducts((prev) =>
      prev.map((p) => {
        const soldItem = items.find((i) => i.product === p.name);
        if (!soldItem) return p;
        const newStock = Math.max((p.stock || 0) - soldItem.quantity, 0);
        return { ...p, stock: newStock };
      })
    );

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

  // -------------------- RECORD PAYMENT --------------------
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

  // -------------------- DELETE STOCK ITEM --------------------
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

      setProducts((prev) => prev.filter((p) => p.name !== itemName));
    }
  };

  // -------------------- RESET ALL DATA --------------------
  const resetData = () => {
    if (window.confirm("This will permanently delete ALL data. Continue?")) {
      setSales([]);
      setPurchases([]);
      setCustomers([]);
      setProducts([]);
      localStorage.removeItem("sales");
      localStorage.removeItem("purchases");
      localStorage.removeItem("customers");
      localStorage.removeItem("products");
    }
  };

  // -------------------- GET INVENTORY --------------------
  const getInventory = () => {
    const stockMap = {};

    // Purchases
    purchases.forEach((p) => {
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
        const buyingPrice = Number(it.buyingPrice) || 0;
        const sellingPrice = Number(it.sellingPrice) || 0;

        stockMap[it.item].purchased += qty;
        stockMap[it.item].costSum += buyingPrice * qty;
        if (sellingPrice > 0) stockMap[it.item].sellingPrice = sellingPrice;
      });
    });

    // Sales
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

    return Object.entries(stockMap).map(([item, data]) => {
      const buyingPrice = data.purchased > 0 ? data.costSum / data.purchased : 0;
      const inStock = data.purchased - data.sold;
      const totalValue = buyingPrice * inStock;

      const productData = products.find((p) => p.name === item);
      const image = productData?.image || "";

      return {
        item,
        purchased: data.purchased,
        sold: data.sold,
        buyingPrice,
        sellingPrice: data.sellingPrice || productData?.sellingPrice || 0,
        inStock,
        totalValue,
        image,
      };
    });
  };

  // -------------------- PROFIT / LOSS --------------------
  const getProfitLoss = () => {
    const totalPurchase = purchases.reduce(
      (sum, p) => sum + (p.totalCost || 0),
      0
    );
    const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    return { totalPurchase, totalSales, profit: totalSales - totalPurchase };
  };

  // -------------------- TRANSACTIONS --------------------
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

  // -------------------- PERSIST DATA --------------------
  useEffect(() => {
    localStorage.setItem("purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // -------------------- EXPORT CONTEXT --------------------
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
        getInventory,
        getProfitLoss,
        getTransactions,
        deleteStockItem,
        resetData,
        addSale,
        recordPayment,
        addOrUpdateProduct,
        deleteProduct,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
