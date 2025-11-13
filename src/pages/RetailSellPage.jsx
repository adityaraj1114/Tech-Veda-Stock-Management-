import React, { useContext, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import AddProductModal from "../components/AddProductModal";
import ProductCard from "../components/ProductCard";
import CartModal from "../components/CartModal";
import BillModal from "../components/BillModal";
import TransactionsList from "../components/TransactionsList";

import { PurchaseContext } from "../context/PurchaseContext";
import { ProfileContext } from "../context/ProfileContext";

export default function RetailSalePage() {
  const { getPurchasedItems } = useContext(PurchaseContext);
  const { profile } = useContext(ProfileContext);

  const [inventory, setInventory] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [billModalData, setBillModalData] = useState(null);

  const [transactions, setTransactions] = useState(() => {
    try {
      const raw = localStorage.getItem("retailer_transactions") || "[]";
      return JSON.parse(raw);
    } catch {
      return [];
    }
  });

  // 🧩 Load items from PurchaseContext into inventory
  useEffect(() => {
    const items = getPurchasedItems();
    const merged = items.map((i, idx) => ({
      id: i.id || `p-${idx}-${Date.now()}`,
      name: i.item,
      sellingPrice: Number(i.sellingPrice || 0),
      stock: Number(i.quantity || 0),
      image: i.image || "",
    }));
    setInventory(merged);
  }, [getPurchasedItems]);

  // 💾 Save transactions to LocalStorage
  useEffect(() => {
    localStorage.setItem("retailer_transactions", JSON.stringify(transactions));
  }, [transactions]);

  // 💰 Compute grand total of selected items
  const grandTotal = useMemo(
    () =>
      selected.reduce(
        (sum, it) => sum + Number(it.sellingPrice || 0) * Number(it.qty || 0),
        0
      ),
    [selected]
  );

  // 🛒 Add product to cart
  const addProductToCart = (prod) => {
    setSelected((prev) => {
      const idx = prev.findIndex((p) => String(p.id) === String(prod.id));
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].qty = Math.min(updated[idx].qty + 1, prod.stock || Infinity);
        return updated;
      }
      return [
        ...prev,
        {
          id: prod.id,
          name: prod.name,
          sellingPrice: prod.sellingPrice,
          stock: prod.stock,
          image: prod.image || "",
          qty: 1,
        },
      ];
    });
  };

  // ✏️ Update product quantity
  const updateQty = (id, qty) => {
    setSelected((prev) =>
      prev
        .map((p) =>
          String(p.id) === String(id)
            ? { ...p, qty: Math.max(0, Math.min(Number(qty || 0), p.stock || Infinity)) }
            : p
        )
        .filter((p) => p.qty > 0)
    );
  };

  // ❌ Remove from cart
  const removeFromCart = (id) =>
    setSelected((prev) => prev.filter((p) => String(p.id) !== String(id)));

  // 🧾 Generate Bill
  const generateBill = (transactionToView = null) => {
    if (transactionToView) {
      setBillModalData(transactionToView);
      return;
    }

    if (selected.length === 0) {
      alert("Select at least one product.");
      return;
    }

    const now = new Date();
    const bill = {
      id: Date.now(),
      dateISO: now.toISOString(),
      dateDisplay: now.toLocaleString("en-IN", { hour12: true }),
      items: selected.map((s) => ({
        id: s.id,
        name: s.name,
        qty: s.qty,
        sellingPrice: s.sellingPrice,
        lineTotal: Number(s.sellingPrice) * Number(s.qty),
      })),
      total: selected.reduce((sum, s) => sum + s.sellingPrice * s.qty, 0),
    };

    // Update stock
    setInventory((prev) =>
      prev.map((p) => {
        const sel = bill.items.find((it) => String(it.id) === String(p.id));
        if (!sel) return p;
        return { ...p, stock: Math.max(0, (p.stock || 0) - sel.qty) };
      })
    );

    // 🆕 Add new transaction at TOP
    setTransactions((prev) => [bill, ...prev]);

    setSelected([]);
    setBillModalData(bill);
  };

  // 👁️ View existing transaction
  const handleViewTransaction = (tx) => {
    setBillModalData(tx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🗑 Delete transaction
  const handleDeleteTransaction = (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // ➕ Add or Update Product
  const handleAddProduct = (newProd) => {
    setInventory((prev) => {
      const idx = prev.findIndex(
        (p) => p.name.trim().toLowerCase() === newProd.name.trim().toLowerCase()
      );
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          ...newProd,
          stock: Number(newProd.stock) || updated[idx].stock,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `p-${Date.now()}`,
          ...newProd,
          sellingPrice: Number(newProd.sellingPrice) || 0,
          stock: Number(newProd.stock) || 0,
        },
      ];
    });
  };

  return (
    <div className="container mt-4 mb-5 pb-5">
      {/* Heading */}
      <motion.h2
        className="mb-4 fw-bold text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(90deg, #3826faff, #03a914ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "1.6rem",
        }}
      >
        🛍️ Retail — Sell Products
      </motion.h2>

      {/* Action Buttons */}
      <motion.div
        className="d-flex justify-content-center gap-3 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <button
          className="btn btn-outline-primary px-4"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add Product
        </button>
        <button
          className="btn btn-success px-4"
          disabled={selected.length === 0}
          onClick={() => generateBill()}
        >
          🧾 Generate Bill
        </button>
      </motion.div>

      {/* Product Grid */}
      <motion.div
        className="row g-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {inventory.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info text-center">
              No products available. Add products first.
            </div>
          </div>
        ) : (
          inventory.map((p) => (
            <div key={p.id} className="col-6 col-md-4 col-lg-2">
              <ProductCard
                product={p}
                selectedQty={
                  (selected.find((s) => String(s.id) === String(p.id)) || {}).qty || 0
                }
                onAdd={() => addProductToCart(p)}
                onQtyChange={(q) => updateQty(p.id, q)}
                onRemove={() => removeFromCart(p.id)}
              />
            </div>
          ))
        )}
      </motion.div>

      {/* Floating Cart Button */}
      {selected.length > 0 && (
        <motion.button
          className="btn btn-dark position-fixed shadow"
          style={{
            bottom: 20,
            right: 20,
            borderRadius: "50%",
            width: 60,
            height: 60,
            zIndex: 1050,
          }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setCartOpen(true)}
          title="View Cart"
        >
          🛒
          <span className="badge bg-danger ms-1">{selected.length}</span>
        </motion.button>
      )}

      {/* Cart Modal */}
      <CartModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={selected}
        updateQty={updateQty}
        removeItem={removeFromCart}
        grandTotal={grandTotal}
        onGenerateBill={() => {
          setCartOpen(false);
          generateBill();
        }}
      />

      {/* Bill Modal */}
      <BillModal
        bill={billModalData}
        onClose={() => setBillModalData(null)}
        profile={profile}
      />

      {/* Transactions Section */}
      <motion.hr
        className="my-5"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ delay: 0.6 }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <TransactionsList
          transactions={transactions}
          onView={handleViewTransaction}
          onDelete={handleDeleteTransaction}
        />
      </motion.div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSave={(prod) => {
            handleAddProduct(prod);
            setShowAddModal(false);
          }}
          inventory={inventory}
        />
      )}
    </div>
  );
}
