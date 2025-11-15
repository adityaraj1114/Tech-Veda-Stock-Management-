import React, { useEffect, useState } from "react";

/**
 * Props:
 * - onClose()
 * - onSave(product)  → adds product to PURCHASE LIST
 * - addOrUpdateProduct(product) → adds/updates in PRODUCTS LIST (inventory)
 * - inventory = [] → existing products
 */
export default function AddProductModal({
  onClose,
  onSave,
  addOrUpdateProduct,
  inventory = [],
}) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("new");

  const [form, setForm] = useState({
    name: "",
    sellingPrice: "",
    stock: "",
    image: "", // FIX: use image instead of imageBase64
  });

  // Load product details when selected
  useEffect(() => {
    if (selectedId !== "new") {
      const prod = inventory.find((p) => String(p.id) === String(selectedId));
      if (prod) {
        setForm({
          name: prod.name || "",
          sellingPrice: prod.sellingPrice ?? "",
          stock: prod.stock ?? "",
          image: prod.image ?? "",
        });
        setSearch(prod.name || "");
      }
    }
  }, [selectedId, inventory]);

  // Convert image to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setForm((p) => ({ ...p, image: base64 }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.sellingPrice) {
      alert("Please provide product name and selling price.");
      return;
    }

    const id = selectedId === "new" ? `p-${Date.now()}` : selectedId;

    const payload = {
      id,
      name: form.name.trim(),
      sellingPrice: Number(form.sellingPrice),
      stock: Number(form.stock) || 0,
      image: form.image || "",
    };

    // 1️⃣ Add/Update in central inventory (PRODUCTS LIST)
    addOrUpdateProduct(payload);

    // 2️⃣ Add to purchase list (RETAIL SALE)
    onSave(payload);

    // Reset form
    setSearch("");
    setSelectedId("new");
    setForm({ name: "", sellingPrice: "", stock: "", image: "" });

    onClose();
  };

  return (
    <div className="modal d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div
          className="modal-content shadow-lg"
          style={{
            background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
            borderRadius: "1rem",
            overflow: "hidden",
          }}
        >
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(90deg, #00c9ff, #92fe9d)",
              color: "#fff",
            }}
          >
            <h5
              className="modal-title fw-bold"
              style={{
                background: "linear-gradient(90deg, #062229ff, #172e1aff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Add / Edit Product
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body position-relative">
            <label className="form-label">Search or type product name</label>
            <input
              className="form-control mb-2"
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                setSearch(value);

                const found = inventory.find((p) =>
                  p.name.toLowerCase().includes(value.toLowerCase())
                );

                if (found) {
                  setSelectedId(found.id);
                  setForm({
                    name: found.name,
                    sellingPrice: found.sellingPrice,
                    stock: found.stock,
                    image: found.image,
                  });
                } else {
                  setSelectedId("new");
                  setForm((prev) => ({ ...prev, name: value }));
                }
              }}
              placeholder="Search saved products or type new product..."
            />

            {/* Suggestions */}
            {search.trim() && (
              <ul
                className="list-group position-absolute"
                style={{
                  zIndex: 1200,
                  width: "48%",
                  maxHeight: 160,
                  overflowY: "auto",
                }}
              >
                {inventory
                  .filter((p) =>
                    p.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .slice(0, 6)
                  .map((p) => (
                    <li
                      key={p.id}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setSelectedId(p.id);
                        setSearch(p.name);
                        setForm({
                          name: p.name,
                          sellingPrice: p.sellingPrice,
                          stock: p.stock,
                          image: p.image,
                        });
                      }}
                    >
                      {p.name} — ₹{Number(p.sellingPrice)} — Stock: {p.stock}
                    </li>
                  ))}
              </ul>
            )}

            {/* FORM */}
            <div className="row mt-4">
              <div className="col-md-6 mb-2">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div className="col-md-3 mb-2">
                <label className="form-label">Selling Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sellingPrice: e.target.value }))
                  }
                />
              </div>

              <div className="col-md-3 mb-2">
                <label className="form-label">In-stock Qty</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, stock: e.target.value }))
                  }
                />
              </div>

              <div className="col-12 mt-3">
                <label className="form-label">Image (optional)</label>
                <div className="d-flex align-items-center gap-3">
                  <input type="file" accept="image/*" onChange={handleImage} />

                  {form.image && (
                    <img
                      src={form.image}
                      alt="preview"
                      style={{
                        width: 80,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #ccc",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer d-flex justify-content-between">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-success px-4" onClick={handleSave}>
              ✅ Save Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
