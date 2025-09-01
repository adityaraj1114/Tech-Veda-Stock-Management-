import React from "react";

export default function ProfileForm({
  form,
  editing,
  previewVisible,
  onChange,
  onLogoUpload,
  onSave,
}) {
  // disable inputs when previewVisible && not editing
  const disabled = previewVisible && !editing;

  return (
    <form onSubmit={onSave} className="row g-3">
      {/* Owner & Shop */}
      <div className="col-md-6">
        <label className="form-label">Owner Name</label>
        <input
          name="ownerName"
          className="form-control"
          value={form.ownerName}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">Shop Name</label>
        <input
          name="shopName"
          className="form-control"
          value={form.shopName}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>

      {/* Address */}
      <div className="col-md-6">
        <label className="form-label">Address Line 1</label>
        <input
          name="addressLine1"
          className="form-control"
          value={form.addressLine1}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">Address Line 2</label>
        <input
          name="addressLine2"
          className="form-control"
          value={form.addressLine2}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">City</label>
        <input
          name="city"
          className="form-control"
          value={form.city}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">State</label>
        <input
          name="state"
          className="form-control"
          value={form.state}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>
      <div className="col-md-4">
        <label className="form-label">Pincode</label>
        <input
          name="pincode"
          className="form-control"
          value={form.pincode}
          onChange={onChange}
          required
          disabled={disabled}
        />
      </div>

      {/* Contact & Tax */}
      <div className="col-md-6">
        <label className="form-label">Phone</label>
        <input
          name="phone"
          className="form-control"
          value={form.phone}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">Email</label>
        <input
          type="email"
          name="email"
          className="form-control"
          value={form.email}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">GSTIN</label>
        <input
          name="gstin"
          className="form-control"
          value={form.gstin}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      <div className="col-md-6">
        <label className="form-label">PAN</label>
        <input
          name="pan"
          className="form-control"
          value={form.pan}
          onChange={onChange}
          disabled={disabled}
        />
      </div>

      {/* Logo Upload */}
      <div className="col-md-6">
        <label className="form-label">Upload Logo</label>
        <input
          type="file"
          className="form-control"
          onChange={onLogoUpload}
          disabled={disabled}
        />
      </div>

      {/* Save / Update */}
      <div className="col-12">
        <button
          type="submit"
          className={`btn w-100 ${
            previewVisible && !editing ? "btn-warning" : "btn-primary"
          }`}
        >
          {previewVisible && !editing ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
}
