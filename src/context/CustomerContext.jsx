import React, { createContext, useContext, useState, useEffect } from "react";

// ✅ Phone normalization helper
const normalizePhone = (phone) =>
  (phone || "").replace(/\D/g, "").trim() || "NA";

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  // -------------------- All Customers --------------------
  const [customers, setCustomers] = useState(() => {
    try {
      const raw = localStorage.getItem("customers");
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });

  // -------------------- Current Customer (Form State) --------------------
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    gstin: "",
    billingAddress: "",
    shippingAddress: "",
    contactPhone: "",
  });

  // -------------------- Add Customer --------------------
  const addCustomer = (info) => {
    setCustomers((prev) => {
      const phoneB = normalizePhone(info.contactPhone);

      const existing = prev.find((c) => {
        const sameName =
          c.name?.trim().toLowerCase() === info.name?.trim().toLowerCase();
        const phoneA = normalizePhone(c.contactPhone);
        if (phoneA === "NA" || phoneB === "NA") {
          return sameName;
        }
        return sameName && phoneA === phoneB;
      });

      if (existing) {
        // Merge old + new details, increment ledger
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                name: info.name || c.name,
                contactPhone: info.contactPhone || c.contactPhone,
                billingAddress: info.billingAddress || c.billingAddress,
                shippingAddress: info.shippingAddress || c.shippingAddress,
                gstin: info.gstin || c.gstin,
                totalPurchase:
                  (c.totalPurchase || 0) + (info.totalPurchase || 0),
                paidAmount: (c.paidAmount || 0) + (info.paidAmount || 0),
                pendingAmount:
                  (c.pendingAmount || 0) + (info.pendingAmount || 0),
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
            shippingAddress: info.shippingAddress || "",
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
      prev.map((c) => {
        if (c.id !== id) return c;

        return {
          ...c,
          name: updatedData.name || c.name,
          contactPhone: updatedData.contactPhone || c.contactPhone,
          billingAddress: updatedData.billingAddress || c.billingAddress,
          shippingAddress: updatedData.shippingAddress || c.shippingAddress,
          gstin: updatedData.gstin || c.gstin,
          totalPurchase:
            updatedData.totalPurchase != null
              ? (c.totalPurchase || 0) + updatedData.totalPurchase
              : c.totalPurchase || 0,
          paidAmount:
            updatedData.paidAmount != null
              ? (c.paidAmount || 0) + updatedData.paidAmount
              : c.paidAmount || 0,
          pendingAmount:
            updatedData.pendingAmount != null
              ? (c.pendingAmount || 0) + updatedData.pendingAmount
              : c.pendingAmount || 0,
        };
      })
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
      const phoneB = normalizePhone(extraInfo.contactPhone);

      const existing = prev.find((c) => {
        const sameName = c.name === customerName;
        const phoneA = normalizePhone(c.contactPhone);
        if (phoneA === "NA" || phoneB === "NA") {
          return sameName;
        }
        return sameName && phoneA === phoneB;
      });

      if (existing) {
        return prev.map((c) =>
          c.id === existing.id
            ? {
                ...c,
                totalPurchase: (c.totalPurchase || 0) + amount,
                pendingAmount: (c.pendingAmount || 0) + amount,
                contactPhone: extraInfo.contactPhone || c.contactPhone,
                billingAddress: extraInfo.billingAddress || c.billingAddress,
                shippingAddress: extraInfo.shippingAddress || c.shippingAddress,
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
            shippingAddress: extraInfo.shippingAddress || "",
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

  // -------------------- Persist to localStorage --------------------
  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        customerInfo,
        setCustomerInfo,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        updateCustomerLedger,
        recordPayment,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => useContext(CustomerContext);
