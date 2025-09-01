import React, { createContext, useContext, useState, useEffect } from "react";

const InventoryContext = createContext({
  sales: [],
  purchases: [],
  customers: [],
  addSale: () => {},
  addPurchase: () => {},
  addCustomer: () => {},
  deleteCustomer: () => {},
  recordPayment: () => {},
  deleteSale: () => {},
  deletePurchase: () => {},
  deleteStockItem: () => {},
  resetData: () => {},
  getInventory: () => [],
  getProfitLoss: () => ({}),
  getTransactions: () => [],
});

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

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem("purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  // Add a new purchase
  const addPurchase = ({ supplier, item, quantity, cost }) => {
    setPurchases((prev) => [
      ...prev,
      {
        id: Date.now(),
        supplier: supplier.trim(),
        item: item.trim(),
        quantity: parseInt(quantity, 10),
        cost: parseFloat(cost),
        totalCost: parseInt(quantity, 10) * parseFloat(cost),
        date: new Date().toLocaleString(),
      },
    ]);
  };

  // Add a new sale
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

      // Update customer ledger
      updateCustomerLedger(customer, batch.reduce((s, i) => s + i.totalAmount, 0));
    } else {
      const newSale = {
        id: Date.now(),
        customer: saleData.customer.trim(),
        product: saleData.product.trim(),
        quantity: saleData.quantity,
        unitPrice: saleData.unitPrice,
        totalAmount: saleData.totalAmount,
        date: new Date().toLocaleString(),
      };
      setSales((prev) => [...prev, newSale]);

      // Update customer ledger
      updateCustomerLedger(saleData.customer, newSale.totalAmount);
    }
  };

  // Add customer manually
  const addCustomer = (custData) => {
    const newCustomer = {
      id: Date.now(),
      name: custData.name.trim(),
      billingAddress: custData.billingAddress || "",
      shippingAddress: custData.shippingAddress || "",
      contactPhone: custData.contactPhone || "",
      gstin: custData.gstin || "",
      totalPurchase: parseFloat(custData.totalPurchase || 0),
      paidAmount: parseFloat(custData.paidAmount || 0),
      pendingAmount:
        parseFloat(custData.totalPurchase || 0) -
        parseFloat(custData.paidAmount || 0),
    };
    setCustomers((prev) => [...prev, newCustomer]);
  };

  // Delete customer
  const deleteCustomer = (id) => {
    if (window.confirm("Delete this customer?")) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Update customer ledger when new sale happens
  const updateCustomerLedger = (customerName, amount) => {
    setCustomers((prev) => {
      const existing = prev.find((c) => c.name === customerName);
      if (existing) {
        return prev.map((c) =>
          c.name === customerName
            ? {
                ...c,
                totalPurchase: c.totalPurchase + amount,
                pendingAmount: c.pendingAmount + amount,
              }
            : c
        );
      } else {
        return [
          ...prev,
          {
            id: Date.now(),
            name: customerName,
            totalPurchase: amount,
            paidAmount: 0,
            pendingAmount: amount,
          },
        ];
      }
    });
  };

  // Record a payment
  const recordPayment = (custId, amount) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === custId
          ? {
              ...c,
              paidAmount: c.paidAmount + amount,
              pendingAmount: Math.max(c.pendingAmount - amount, 0),
            }
          : c
      )
    );
  };

  // Delete purchase
  const deletePurchase = (id) => {
    if (window.confirm("Delete this purchase?")) {
      setPurchases((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Delete sale
  const deleteSale = (id) => {
    if (window.confirm("Delete this sale?")) {
      setSales((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Delete all records of one stock item
  const deleteStockItem = (itemName) => {
    if (window.confirm(`Delete all purchase & sale records for "${itemName}"?`)) {
      setPurchases((prev) => prev.filter((p) => p.item !== itemName));
      setSales((prev) => prev.filter((s) => s.product !== itemName));
    }
  };

  // Reset all data
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

  // Compute inventory
  const getInventory = () => {
    const stockMap = {};

    purchases.forEach((p) => {
      if (!stockMap[p.item]) {
        stockMap[p.item] = { purchased: 0, sold: 0, costSum: 0 };
      }
      stockMap[p.item].purchased += p.quantity;
      stockMap[p.item].costSum += p.quantity * p.cost;
    });

    sales.forEach((s) => {
      if (!stockMap[s.product]) {
        stockMap[s.product] = { purchased: 0, sold: 0, costSum: 0 };
      }
      stockMap[s.product].sold += s.quantity;
    });

    return Object.entries(stockMap).map(([item, data]) => {
      const unitPrice = data.purchased > 0 ? data.costSum / data.purchased : 0;
      const inStock = data.purchased - data.sold;
      const totalValue = unitPrice * inStock;
      return { item, purchased: data.purchased, sold: data.sold, unitPrice, inStock, totalValue };
    });
  };

  // Profit & Loss
  const getProfitLoss = () => {
    const totalPurchase = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    const totalSales = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    return { totalPurchase, totalSales, profit: totalSales - totalPurchase };
  };

  // Combined transactions
  const getTransactions = () => {
    const combined = [
      ...purchases.map((p) => ({
        id: p.id,
        date: p.date,
        type: "Purchase",
        details: `${p.supplier} supplied ${p.quantity} × ${p.item}`,
        amount: p.totalCost,
      })),
      ...sales.map((s) => ({
        id: s.id,
        date: s.date,
        type: "Sale",
        details: `${s.customer} bought ${s.quantity} × ${s.product}`,
        amount: s.totalAmount,
      })),
    ];
    return combined.sort((a, b) => b.id - a.id);
  };

  return (
    <InventoryContext.Provider
      value={{
        sales,
        purchases,
        customers,
        addSale,
        addPurchase,
        addCustomer,
        deleteCustomer,
        recordPayment,
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
