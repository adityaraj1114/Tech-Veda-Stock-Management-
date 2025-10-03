// src/context/CustomerCatalogContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CustomerCatalogContext = createContext();

export function CustomerCatalogProvider({ children }) {
  // ✅ Load directly from localStorage (lazy init)
  const [catalogProducts, setCatalogProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("catalogProducts")) || [];
  });
  const [hiddenProducts, setHiddenProducts] = useState(() => {
    return JSON.parse(localStorage.getItem("hiddenProducts")) || [];
  });

  // ✅ Save whenever data changes
  useEffect(() => {
    localStorage.setItem("catalogProducts", JSON.stringify(catalogProducts));
  }, [catalogProducts]);

  useEffect(() => {
    localStorage.setItem("hiddenProducts", JSON.stringify(hiddenProducts));
  }, [hiddenProducts]);

  // CRUD functions
  const addProduct = (product) => {
    // Prevent duplicate by name
    const exists = catalogProducts.find(
      (p) => p.name.toLowerCase() === product.name.toLowerCase()
    );
    if (exists) {
      // update instead of add duplicate
      updateProduct(exists.id, product);
      return;
    }
    setCatalogProducts((prev) => [...prev, { ...product, id: Date.now() }]);
  };

  const updateProduct = (id, updated) => {
    setCatalogProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = (id) => {
    setCatalogProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const hideProduct = (id) => {
    const prod = catalogProducts.find((p) => p.id === id);
    if (prod) {
      setCatalogProducts((prev) => prev.filter((p) => p.id !== id));
      setHiddenProducts((prev) => [...prev, prod]);
    }
  };

  const unhideProduct = (id) => {
    const prod = hiddenProducts.find((p) => p.id === id);
    if (prod) {
      setHiddenProducts((prev) => prev.filter((p) => p.id !== id));
      setCatalogProducts((prev) => [...prev, prod]);
    }
  };

  return (
    <CustomerCatalogContext.Provider
      value={{
        catalogProducts,
        hiddenProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        hideProduct,
        unhideProduct,
      }}
    >
      {children}
    </CustomerCatalogContext.Provider>
  );
}

export function useCustomerCatalog() {
  return useContext(CustomerCatalogContext);
}
