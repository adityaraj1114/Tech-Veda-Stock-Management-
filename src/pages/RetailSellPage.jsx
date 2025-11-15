// src/pages/RetailSalePage.jsx

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
  const { products, setProducts, addOrUpdateProduct } =
    useContext(PurchaseContext);

  const { profile } = useContext(ProfileContext);

  const [selected, setSelected] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [billModalData, setBillModalData] = useState(null);

  // ============================================
  //  Load Retail Transactions (Bills)
  // ============================================
  const [transactions, setTransactions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("retailer_transactions")) || [];
    } catch {
      return [];
    }
  });

  // Save bills
  useEffect(() => {
    localStorage.setItem("retailer_transactions", JSON.stringify(transactions));
  }, [transactions]);

  // ============================================
  // ⭐ PRODUCT LIST FOR RETAIL SALE
  // (purchases already saved inside products → so no merging needed)
  // ============================================

  const productList = useMemo(() => {
    return Array.isArray(products) ? products : [];
  }, [products]);

  // ============================================
  // 💰 Calculate Grand Total
  // ============================================
  const grandTotal = useMemo(
    () =>
      selected.reduce(
        (sum, it) =>
          sum + Number(it.sellingPrice || 0) * Number(it.qty || 0),
        0
      ),
    [selected]
  );

  // ============================================
  // 🛒 Add Product to Cart
  // ============================================
  const addProductToCart = (prod) => {
    setSelected((prev) => {
      const idx = prev.findIndex((p) => p.id === prod.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].qty = Math.min(updated[idx].qty + 1, prod.stock);
        return updated;
      }
      return [...prev, { ...prod, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    setSelected((prev) =>
      prev
        .map((p) =>
          p.id === id
            ? {
                ...p,
                qty: Math.max(
                  0,
                  Math.min(Number(qty || 0), Number(p.stock || Infinity))
                ),
              }
            : p
        )
        .filter((p) => p.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  // ============================================
  // 🧾 Generate Bill
  // ============================================
  const generateBill = () => {
    if (selected.length === 0) {
      alert("Select at least one product");
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
        lineTotal: s.qty * s.sellingPrice,
      })),

      total: selected.reduce((sum, s) => sum + s.qty * s.sellingPrice, 0),
    };

    // Update STOCK in products list
    setProducts((prev) =>
      prev.map((p) => {
        const sel = selected.find((s) => s.id === p.id);
        if (!sel) return p;
        return { ...p, stock: Math.max(0, p.stock - sel.qty) };
      })
    );

    // Save bill (latest on top)
    setTransactions((prev) => [bill, ...prev]);

    // Show bill
    setBillModalData(bill);

    // Clear cart
    setSelected([]);
  };

  // ============================================
  // ➕ Add / Update Product from Add Modal
  // ============================================
  const handleAddProduct = (prod) => {
    addOrUpdateProduct(prod);
    setShowAddModal(false);
  };

  // ============================================
  // UI Rendering
  // ============================================

  return (
    <div className="container mt-4 mb-5 pb-5">
      <motion.h2
        className="mb-4 fw-bold text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(90deg, #3826fa, #03a914)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        🛍️ Retail — Sell Products
      </motion.h2>

      {/* Buttons */}
      <div className="d-flex justify-content-center gap-3 mb-4">
        <button
          className="btn btn-outline-primary px-4"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add Product
        </button>
        <button
          className="btn btn-success px-4"
          disabled={selected.length === 0}
          onClick={generateBill}
        >
          🧾 Generate Bill
        </button>
      </div>

      {/* Product Grid */}
      <div className="row g-3">
        {productList.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info text-center">
              No products available. Add or purchase products.
            </div>
          </div>
        ) : (
          productList.map((p) => (
            <div key={p.id} className="col-6 col-md-4 col-lg-2">
              <ProductCard
                product={p}
                selectedQty={(selected.find((s) => s.id === p.id) || {}).qty || 0}
                onAdd={() => addProductToCart(p)}
                onQtyChange={(q) => updateQty(p.id, q)}
                onRemove={() => removeFromCart(p.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Floating Cart */}
      {selected.length > 0 && (
        <motion.button
          className="btn btn-dark position-fixed shadow"
          style={{
            bottom: 20,
            right: 20,
            borderRadius: "50%",
            width: 60,
            height: 60,
            zIndex: 999,
          }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setCartOpen(true)}
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

      <hr className="my-5" />

      {/* Transactions List */}
      <TransactionsList
        transactions={transactions}
        onView={(tx) => setBillModalData(tx)}
        onDelete={(id) =>
          setTransactions((prev) => prev.filter((t) => t.id !== id))
        }
      />

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddProduct}
        />
      )}
    </div>
  );
}
