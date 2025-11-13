import React, { useEffect, useState } from "react";

/**
 * Props:
 * - onClose(): close modal
 * - onSave(product): save product to PurchaseContext (id, name, sellingPrice, stock, image)
 * - inventory: existing products array (for search/select)
 */
export default function AddProductModal({ onClose, onSave, inventory = [] }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("new");
  const [form, setForm] = useState({
    name: "",
    sellingPrice: "",
    stock: "",
    imageBase64: "",
  });

  useEffect(() => {
    if (selectedId && selectedId !== "new") {
      const prod = inventory.find((p) => String(p.id) === String(selectedId));
      if (prod) {
        setForm({
          name: prod.name || "",
          sellingPrice: prod.sellingPrice ?? "",
          stock: prod.stock ?? "",
          imageBase64: prod.image ?? "",
        });
        setSearch(prod.name || "");
      }
    }
  }, [selectedId, inventory]);

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
    setForm((p) => ({ ...p, imageBase64: base64 }));
  };

  const handleSelectSuggestion = (p) => {
    setSelectedId(p.id);
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
      image: form.imageBase64 || "",
    };
    onSave(payload);
    setSearch("");
    setSelectedId("new");
    setForm({ name: "", sellingPrice: "", stock: "", imageBase64: "" });
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
                setSearch(e.target.value);
                const found = inventory.find((p) =>
                  p.name.toLowerCase().includes(e.target.value.toLowerCase())
                );
                if (found) setSelectedId(found.id);
                else setSelectedId("new");
                setForm((f) => ({ ...f, name: e.target.value }));
              }}
              placeholder="Search saved products or type new product name..."
            />

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
                        handleSelectSuggestion(p);
                        setSearch(p.name);
                      }}
                    >
                      {p.name} — ₹{Number(p.sellingPrice).toFixed(2)} — In stock: {p.stock}
                    </li>
                  ))}
              </ul>
            )}

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
                  className="form-control"
                  type="number"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sellingPrice: e.target.value }))
                  }
                />
              </div>

              <div className="col-md-3 mb-2">
                <label className="form-label">In-stock Qty</label>
                <input
                  className="form-control"
                  type="number"
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
                  {form.imageBase64 && (
                    <img
                      src={form.imageBase64}
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
              ✅ Add / Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
