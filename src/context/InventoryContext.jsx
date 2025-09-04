import React, { createContext, useContext, useState, useEffect } from "react";

const InventoryContext = createContext({});

// localStorage safe parser
const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const InventoryProvider = ({ children }) => {
  // Initialize from localStorage
  const [sales, setSales] = useState(() => safeParse("sales"));
  const [purchases, setPurchases] = useState(() => safeParse("purchases"));
  const [customers, setCustomers] = useState(() => safeParse("customers"));
  const [purchaseCart, setPurchaseCart] = useState([]);

  // --------------------
  // Purchase Cart
  // --------------------
  const addToPurchaseCart = (itemData) => {
    setPurchaseCart((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        item: itemData.item.trim(),
        quantity: parseInt(itemData.quantity, 10),
        cost: parseFloat(itemData.cost),
        totalCost:
          parseInt(itemData.quantity, 10) * parseFloat(itemData.cost),
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
    setPurchaseCart([]); // empty cart
  };

  const clearPurchaseCart = () => setPurchaseCart([]);

  // --------------------
  // Simple Purchases (single item)
  // --------------------
  const addPurchase = ({ supplier, item, quantity, cost }) => {
    setPurchases((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        supplier: supplier.trim(),
        items: [
          {
            id: Date.now() + Math.random(),
            item: item.trim(),
            quantity: parseInt(quantity, 10),
            cost: parseFloat(cost),
            totalCost: parseInt(quantity, 10) * parseFloat(cost),
          },
        ],
        totalCost: parseInt(quantity, 10) * parseFloat(cost),
        date: new Date().toLocaleString(),
      },
    ]);
  };

  const deletePurchase = (id) => {
    if (window.confirm("Delete this purchase?")) {
      setPurchases((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // --------------------
  // Sales
  // --------------------
  const addSale = (saleData) => {
    if (saleData.items) {
      const { customer, items } = saleData;
      const batch = items.map((it) => ({
        id: Date.now() + Math.random(),
        customer: customer.trim(),
        product: it.product.trim(),
        quantity: it.qty ?? it.quantity,
        unitPrice: it.price ?? it.unitPrice,
        totalAmount: it.total,
        date: new Date().toLocaleString(),
      }));

      setSales((prev) => [...prev, ...batch]);

      updateCustomerLedger(
        customer,
        batch.reduce((s, i) => s + i.totalAmount, 0),
        saleData.customerInfo || {} // extra customer info if available
      );
    } else {
      const newSale = {
        id: Date.now() + Math.random(),
        customer: saleData.customer.trim(),
        product: saleData.product.trim(),
        quantity: saleData.quantity,
        unitPrice: saleData.unitPrice,
        totalAmount: saleData.totalAmount,
        date: new Date().toLocaleString(),
      };

      setSales((prev) => [...prev, newSale]);
      updateCustomerLedger(
        saleData.customer,
        newSale.totalAmount,
        saleData.customerInfo || {}
      );
    }
  };

  const deleteSale = (id) => {
    if (window.confirm("Delete this sale?")) {
      setSales((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // --------------------
  // Customers

  // -------------------- Customer Management --------------------
const addCustomer = (info) => {
  setCustomers((prev) => {
    const existing = prev.find(
      (c) => c.name === info.name && c.contactPhone === info.contactPhone
    );

    if (existing) {
      // Update existing customer
      return prev.map((c) =>
        c.id === existing.id
          ? {
              ...c,
              name: info.name || c.name,
              contactPhone: info.contactPhone || c.contactPhone,
              billingAddress: info.billingAddress || c.billingAddress,
              gstin: info.gstin || c.gstin,
              // Ledger updates
              totalPurchase: (c.totalPurchase || 0) + (info.totalPurchase || 0),
              paidAmount: (c.paidAmount || 0) + (info.paidAmount || 0),
              pendingAmount: (c.pendingAmount || 0) + (info.pendingAmount || 0),
            }
          : c
      );
    } else {
      // Add new customer
      return [
        ...prev,
        {
          id: Date.now(),
          name: info.name,
          contactPhone: info.contactPhone || "",
          billingAddress: info.billingAddress || "",
          gstin: info.gstin || "",
          totalPurchase: info.totalPurchase || 0,
          paidAmount: info.paidAmount || 0,
          pendingAmount: info.pendingAmount || 0,
        },
      ];
    }
  });
};

// -------------------- Update Customer --------------------
const updateCustomer = (id, updatedData) => {
  setCustomers((prev) =>
    prev.map((c) =>
      c.id === id
        ? {
            ...c,
            name: updatedData.name || c.name,
            contactPhone: updatedData.contactPhone || c.contactPhone,
            billingAddress: updatedData.billingAddress || c.billingAddress,
            gstin: updatedData.gstin || c.gstin,
            // Ledger values ko overwrite nahi karenge
            totalPurchase: c.totalPurchase || 0,
            paidAmount: c.paidAmount || 0,
            pendingAmount: c.pendingAmount || 0,
          }
        : c
    )
  );
};

// -------------------- Delete Customer --------------------
const deleteCustomer = (id) => {
  if (window.confirm("Delete this customer?")) {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }
};

// -------------------- Update Customer Ledger --------------------
const updateCustomerLedger = (customerName, amount, extraInfo = {}) => {
  setCustomers((prev) => {
    const existing = prev.find((c) => c.name === customerName);

    if (existing) {
      return prev.map((c) =>
        c.name === customerName
          ? {
              ...c,
              totalPurchase: (c.totalPurchase || 0) + amount,
              pendingAmount: (c.pendingAmount || 0) + amount,
              // Customer details update bhi ho jaye
              contactPhone: extraInfo.contactPhone || c.contactPhone,
              billingAddress: extraInfo.billingAddress || c.billingAddress,
              gstin: extraInfo.gstin || c.gstin,
            }
          : c
      );
    } else {
      return [
        ...prev,
        {
          id: Date.now() + Math.random(),
          name: customerName,
          contactPhone: extraInfo.contactPhone || "",
          billingAddress: extraInfo.billingAddress || "",
          gstin: extraInfo.gstin || "",
          totalPurchase: amount,
          paidAmount: 0,
          pendingAmount: amount,
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
            paidAmount: parseFloat((c.paidAmount || 0) + amount),
            pendingAmount: Math.max(
              parseFloat((c.pendingAmount || 0) - amount),
              0
            ),
          }
        : c
    )
  );
};

  // --------------------
  // Stock
  // --------------------
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

      setSales((prev) => prev.filter((s) => s.product !== itemName));
    }
  };

  // --------------------
  // Reset
  // --------------------
  const resetData = () => {
    if (
      window.confirm("This will permanently delete ALL data. Continue?")
    ) {
      setSales([]);
      setPurchases([]);
      setCustomers([]);
      localStorage.removeItem("sales");
      localStorage.removeItem("purchases");
      localStorage.removeItem("customers");
    }
  };

  // --------------------
  // Helpers
  // --------------------
  const getInventory = () => {
    const stockMap = {};

    purchases.forEach((p) => {
      (p.items || []).forEach((it) => {
        if (!stockMap[it.item]) {
          stockMap[it.item] = { purchased: 0, sold: 0, costSum: 0 };
        }
        stockMap[it.item].purchased += it.quantity;
        stockMap[it.item].costSum += it.quantity * it.cost;
      });
    });

    sales.forEach((s) => {
      if (!stockMap[s.product]) {
        stockMap[s.product] = { purchased: 0, sold: 0, costSum: 0 };
      }
      stockMap[s.product].sold += s.quantity;
    });

    return Object.entries(stockMap).map(([item, data]) => {
      const unitPrice =
        data.purchased > 0 ? data.costSum / data.purchased : 0;
      const inStock = data.purchased - data.sold;
      const totalValue = unitPrice * inStock;

      return {
        item,
        purchased: data.purchased,
        sold: data.sold,
        unitPrice,
        inStock,
        totalValue,
      };
    });
  };

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
        details: `${s.customer} bought ${s.quantity} × ${s.product}`,
        amount: s.totalAmount,
      })),
    ];

    return combined.sort((a, b) => b.date.localeCompare(a.date));
  };

  // --------------------
  // Persist to localStorage
  // --------------------
  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  return (
    <InventoryContext.Provider
      value={{
        sales,
        purchases,
        customers,
        purchaseCart,
        addToPurchaseCart,
        completePurchase,
        clearPurchaseCart,
        addSale,
        addPurchase,
        addCustomer,
        deleteCustomer,
        recordPayment,
        updateCustomer,
        deleteSale,
        deletePurchase,
        deleteStockItem,
        resetData,
        getInventory,
        getProfitLoss,
        getTransactions,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
export { InventoryContext };
