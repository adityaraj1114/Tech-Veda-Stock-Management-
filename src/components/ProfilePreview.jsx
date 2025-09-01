import React from "react";

export default function ProfilePreview({
  form,
  editing,
  previewVisible,
  onEdit,
}) {
  if (!previewVisible) return null;

  return (
    <div
      id="profile-preview"
      className="border p-4 mb-4"
      style={{
        width: "210mm",
        margin: "0 auto 1.5rem",
        background: "white",
        boxShadow: "0 0 5px rgba(0,0,0,0.2)",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        {form.logo && (
          <img
            src={form.logo}
            alt="Logo"
            style={{ height: 80, objectFit: "contain" }}
          />
        )}
        <div className="flex-grow-1 px-4">
          <h2 className="mb-1">{form.shopName}</h2>
          <p className="mb-0">Owner: {form.ownerName}</p>
          <p className="mb-0">
            {form.addressLine1}
            {form.addressLine2 && `, ${form.addressLine2}`}
          </p>
          <p className="mb-0">
            {form.city}, {form.state} – {form.pincode}
          </p>
          <p className="mb-0">
            GSTIN: {form.gstin} | PAN: {form.pan}
          </p>
        </div>

        {!editing && (
          <button className="btn btn-outline-primary" onClick={onEdit}>
            ✏️ Edit
          </button>
        )}
      </div>
    </div>
  );
}
