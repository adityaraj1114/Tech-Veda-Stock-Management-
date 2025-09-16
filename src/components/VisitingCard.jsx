// src/components/VisitingCard.jsx
import React from "react";

export default function VisitingCard({ form, onShare }) {
  if (!form || !form.shopName) return null;

  const gradientStyle = {
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    color: "white",
    borderRadius: "16px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
    maxWidth: "100%",
    minHeight: "180px",
    position: "relative",
    overflow: "hidden",
  };

  const overlay = {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(6px)",
    borderRadius: "16px",
  };

  const logoStyle = {
    height: 70,
    width: 70,
    marginRight: "1rem",
    borderRadius: "12px",
    objectFit: "cover",
    backgroundColor: "white",
    padding: "0.4rem",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    zIndex: 1,
  };

  const infoStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "4px",
    zIndex: 1,
  };

  const label = (text) => (
    <strong style={{ color: "#ffd700", fontWeight: 600 }}>{text}</strong>
  );

  return (
    <div className="mb-4" style={{ maxWidth: 720, margin: "auto" }}>
      <div style={gradientStyle}>
        <div style={overlay}></div>

        {form.logo && (
          <img src={form.logo} alt="Logo" style={logoStyle} />
        )}

        <div style={infoStyle}>
          <h3 style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
            {form.shopName}
          </h3>
          <p>
            {label("Owner")}: {form.ownerName}
          </p>
          {form.phone && <p>{label("Phone")}: {form.phone}</p>}
          {form.email && <p>{label("Email")}: {form.email}</p>}
          {form.addressLine1 && (
            <p>
              {label("Address")}: {form.addressLine1}
              {form.addressLine2 ? `, ${form.addressLine2}` : ""}
              {form.city ? `, ${form.city}` : ""}
              {form.state ? `, ${form.state}` : ""}
              {form.pincode ? ` - ${form.pincode}` : ""}
            </p>
          )}
          {form.gstin && <p>{label("GSTIN")}: {form.gstin}</p>}
          {form.pan && <p>{label("PAN")}: {form.pan}</p>}
          {form.website && <p>{label("Website")}: {form.website}</p>}
        </div>
      </div>

      {/* Share button */}
      <div className="d-flex align-items-center justify-content-center pt-3">
        <button
          className="btn btn-lg"
          style={{
            background: "linear-gradient(90deg,#ff9966,#ff5e62)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.6rem 1.5rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
          onClick={onShare}
        >
          📲 Share Card
        </button>
      </div>
    </div>
  );
}
