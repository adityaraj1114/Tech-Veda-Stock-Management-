import React from "react";

export default function ProfilePreview({ form, editing, previewVisible, onEdit }) {
  if (!previewVisible) return null;

  const containerStyle = {
    maxWidth: "100%",
    margin: "0 auto 1.5rem",
    padding: "2rem",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #0f2027, #2c5364, #ff6e7f)",
    color: "white",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    textAlign: "center",
  };

  const logoStyle = {
    height: 100,
    width: 100,
    borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "white",
    padding: "0.5rem",
    marginBottom: "1rem",
    boxShadow: "0 0 8px rgba(255,255,255,0.3)",
  };

  const label = (text) => <strong style={{ color: "#ffd700" }}>{text}</strong>;

  return (
    <div id="profile-preview" style={containerStyle}>
      {form.logo && (
        <img src={form.logo} alt="Logo" style={logoStyle} />
      )}
      <h2 className="mb-2">{form.shopName}</h2>
      <p>{label("Owner")}: {form.ownerName}</p>
      <p>{label("Address")}: {form.addressLine1}{form.addressLine2 && `, ${form.addressLine2}`}</p>
      <p>{form.city}, {form.state} – {form.pincode}</p>
      {form.gstin && <p>{label("GSTIN")}: {form.gstin}</p>}
      {form.pan && <p>{label("PAN")}: {form.pan}</p>}
      {form.phone && <p>{label("Phone")}: {form.phone}</p>}
      {form.email && <p>{label("Email")}: {form.email}</p>}
      {form.website && <p>{label("Website")}: {form.website}</p>}

      {!editing && (
        <button className="btn btn-light mt-3" onClick={onEdit}>
          ✏️ Edit Profile
        </button>
      )}
    </div>
  );
}
