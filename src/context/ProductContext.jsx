import React, { createContext, useContext, useState, useEffect } from "react";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentBill, setCurrentBill] = useState(null);

  // ✅ Load saved data only once (and safely)
  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem("products"));
    const savedTransactions = JSON.parse(localStorage.getItem("transactions"));

    if (savedProducts && Array.isArray(savedProducts)) {
      setProducts(savedProducts);
    }
    if (savedTransactions && Array.isArray(savedTransactions)) {
      setTransactions(savedTransactions);
    }
  }, []);

  // 💾 Auto-save products & transactions to localStorage
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem("products", JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (transactions.length >= 0) {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    }
  }, [transactions]);

  // ➕ Add new product
  const addProduct = (product) => {
    const newProduct = {
      id: Date.now().toString(),
      name: product.name || "Untitled Product",
      image: product.image || "",
      sellingPrice: Number(product.sellingPrice) || 0,
      stock: Number(product.stock) || 0,
    };

    setProducts((prev) => {
      const updated = [...prev, newProduct];
      localStorage.setItem("products", JSON.stringify(updated)); // immediate save
      return updated;
    });
  };

  // ✏️ Edit product
  const updateProduct = (id, updatedData) => {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, ...updatedData } : p
      );
      localStorage.setItem("products", JSON.stringify(updated));
      return updated;
    });
  };

  // 🗑 Delete product
  const deleteProduct = (id) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem("products", JSON.stringify(updated));
      return updated;
    });
  };

  // 🛒 Toggle product in cart
  const toggleSelect = (product) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // 🔢 Update quantity in cart
  const updateQty = (id, qty) => {
    if (qty < 0) return;
    setSelected((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty } : p))
    );
  };

  // ❌ Remove from cart
  const removeFromSelected = (id) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  // 🧾 Generate Bill (and store locally)
  const generateBill = () => {
    if (selected.length === 0) return;

    const date = new Date();
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    const grandTotal = selected.reduce(
      (sum, item) => sum + item.sellingPrice * item.qty,
      0
    );

    const bill = {
      id: Date.now(),
      date: formattedDate,
      time: formattedTime,
      items: selected,
      total: grandTotal,
    };

    // Save new transaction (latest first)
    setTransactions((prev) => {
      const updated = [bill, ...prev];
      localStorage.setItem("transactions", JSON.stringify(updated));
      return updated;
    });

    // Update stock
    setProducts((prev) => {
      const updated = prev.map((p) => {
        const soldItem = selected.find((s) => s.id === p.id);
        if (soldItem) {
          const newStock = Math.max((p.stock || 0) - soldItem.qty, 0);
          return { ...p, stock: newStock };
        }
        return p;
      });
      localStorage.setItem("products", JSON.stringify(updated));
      return updated;
    });

    setCurrentBill(bill);
    setSelected([]);
  };

  const getLastBill = () => {
    if (transactions.length === 0) return null;
    return transactions[0];
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        selected,
        setSelected,
        transactions,
        setTransactions,
        currentBill,
        setCurrentBill,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleSelect,
        updateQty,
        removeFromSelected,
        generateBill,
        getLastBill,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
