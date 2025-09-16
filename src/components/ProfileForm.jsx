// src/components/ProfileForm.jsx
import React from "react";

export default function ProfileForm({
  form,
  editing,
  previewVisible,
  onChange,
  onLogoUpload,
  onSave,
}) {
  const disabled = previewVisible && !editing;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(e); // ✅ event pass kar rahe hain
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      {/* Owner & Shop */}
      <div className="col-md-6">
        <label className="form-label">👤 Owner Name</label>
        <input
          type="text"
          name="ownerName"
          className="form-control"
          placeholder="Enter owner's full name"
          value={form.ownerName || ""}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">🏪 Shop Name</label>
        <input
          type="text"
          name="shopName"
          className="form-control"
          placeholder="Enter shop name"
          value={form.shopName || ""}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>

      {/* Address */}
      <div className="col-md-6">
        <label className="form-label">📍 Address Line 1</label>
        <input
          type="text"
          name="addressLine1"
          className="form-control"
          placeholder="House no, street"
          value={form.addressLine1 || ""}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">Address Line 2</label>
        <input
          type="text"
          name="addressLine2"
          className="form-control"
          placeholder="Landmark, locality (optional)"
          value={form.addressLine2 || ""}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">City</label>
        <input
          type="text"
          name="city"
          className="form-control"
          value={form.city || ""}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">State</label>
        <input
          type="text"
          name="state"
          className="form-control"
          value={form.state || ""}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">Pincode</label>
        <input
          type="text"
          name="pincode"
          className="form-control"
          placeholder="6 digit"
          value={form.pincode || ""}
          onChange={onChange}
          pattern="\d{6}"
          maxLength="6"
          required
          disabled={disabled}
        />
      </div>

      {/* Contact */}
      <div className="col-md-6">
        <label className="form-label">📞 Phone</label>
        <input
          type="text"
          name="phone"
          className="form-control"
          placeholder="10 digit number"
          value={form.phone || ""}
          onChange={onChange}
          pattern="\d{10}"
          maxLength="10"
          disabled={disabled}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">✉️ Email</label>
        <input
          type="email"
          name="email"
          className="form-control"
          placeholder="example@email.com"
          value={form.email || ""}
          onChange={onChange}
          disabled={disabled}
        />
      </div>

      {/* Tax IDs */}
      <div className="col-md-6">
        <label className="form-label">GSTIN</label>
        <input
          type="text"
          name="gstin"
          className="form-control"
          placeholder="Enter GST number"
          value={form.gstin || ""}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">PAN</label>
        <input
          type="text"
          name="pan"
          className="form-control"
          placeholder="ABCDE1234F"
          value={form.pan || ""}
          onChange={onChange}
          pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
          disabled={disabled}
        />
      </div>

      {/* Logo Upload */}
      <div className="col-md-6">
        <label className="form-label">Upload Logo</label>
        <input
          type="file"
          accept="image/*"
          className="form-control"
          onChange={onLogoUpload}
          disabled={disabled}
        />
        {form.logo && (
          <div className="mt-2">
            <img
              src={form.logo}
              alt="Logo Preview"
              style={{
                height: "60px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                padding: "2px",
              }}
            />
          </div>
        )}
      </div>

      {/* Save / Update */}
      <div className="col-12">
        {!disabled && (
          <button type="submit" className="btn btn-primary w-100">
            💾 Save Profile
          </button>
        )}
        {disabled && (
          <button type="button" className="btn btn-warning w-100" disabled>
            ✏️ Update Profile
          </button>
        )}
      </div>
    </form>
  );
}
