import React from "react";

export default function VisitingCard({ form, previewVisible, onShare }) {
  if (!previewVisible) return null;

  return (
    <div className="card mb-4" style={{ maxWidth: 300 }}>
      <div className="card-body text-center">
        {form.logo && (
          <img
            src={form.logo}
            alt="Logo"
            style={{ height: 50, marginBottom: "0.5rem" }}
          />
        )}
        <h5 className="card-title mb-1">{form.shopName}</h5>
        <p className="card-text mb-1">Owner: {form.ownerName}</p>
        <p className="card-text mb-1">Phone: {form.phone}</p>
        <p className="card-text mb-3">Email: {form.email}</p>
      </div>
      <button className="btn btn-sm btn-success mt-2" onClick={onShare}>
          📲 Share Card
        </button>
    </div>
  );
}
