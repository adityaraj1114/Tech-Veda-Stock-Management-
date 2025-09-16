// src/components/ProfilePreview.jsx
import React from "react";

export default function ProfilePreview({ form, editing, previewVisible, onEdit }) {
  if (!previewVisible) return null;

  const containerStyle = {
    maxWidth: "720px",
    margin: "0 auto 1.5rem",
    padding: "2rem",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    color: "white",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  };

  const overlay = {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    zIndex: 0,
    pointerEvents: "none", // ✅ overlay clicks ko block nahi karega
  };

  const logoStyle = {
    height: 110,
    width: 110,
    borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "white",
    padding: "0.5rem",
    marginBottom: "1rem",
    boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
    transition: "transform 0.3s ease",
    zIndex: 1,
  };

  const label = (text) => (
    <strong style={{ color: "#ffd700", fontWeight: 600 }}>{text}</strong>
  );

  const buttonStyle = {
    background: "linear-gradient(90deg, #ff9966, #ff5e62)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0.6rem 1.5rem",
    marginTop: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    zIndex: 1,
  };

  return (
    <div id="profile-preview" style={containerStyle}>
      <div style={overlay}></div>

      {form.logo && (
        <img src={form.logo} alt="Logo" style={logoStyle} />
      )}

      <h2 className="mb-2" style={{ fontWeight: "bold", zIndex: 1 }}>
        {form.shopName}
      </h2>

      <div style={{ zIndex: 1 }}>
        <p>{label("Owner")}: {form.ownerName}</p>
        {form.addressLine1 && (
          <p>
            {label("Address")}: {form.addressLine1}
            {form.addressLine2 ? `, ${form.addressLine2}` : ""}
          </p>
        )}
        {(form.city || form.state || form.pincode) && (
          <p>
            {form.city ? form.city : ""}{form.state ? `, ${form.state}` : ""}{form.pincode ? ` – ${form.pincode}` : ""}
          </p>
        )}
        {form.gstin && <p>{label("GSTIN")}: {form.gstin}</p>}
        {form.pan && <p>{label("PAN")}: {form.pan}</p>}
        {form.phone && <p>{label("Phone")}: {form.phone}</p>}
        {form.email && <p>{label("Email")}: {form.email}</p>}
        {form.website && <p>{label("Website")}: {form.website}</p>}
      </div>

      {!editing && (
        <button style={buttonStyle} onClick={onEdit}>
          ✏️ Edit Profile
        </button>
      )}
    </div>
  );
}
