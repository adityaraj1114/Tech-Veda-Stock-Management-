import React from "react";

export default function VisitingCard({ form, onShare }) {
  if (!form || !form.shopName) return null;

  const cardStyle = {
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    color: "white",
    borderRadius: "20px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    position: "relative",
    overflow: "hidden",
  };

  const overlay = {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.05)",
    // backdropFilter: "blur(6px)",
    borderRadius: "20px",
    zIndex: 0,
  };

  const logoStyle = {
    height: 80,
    width: 80,
    borderRadius: "50%",
    objectFit: "cover",
    backgroundColor: "white",
    padding: "0.5rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    marginBottom: "1rem",
    zIndex: 1,
  };

  const label = (text) => (
    <strong style={{ color: "#ffd700", fontWeight: 600 }}>{text}</strong>
  );

  const infoStyle = {
    zIndex: 1,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    alignItems: "center",
    fontSize: "1rem",
  };

  return (
    <div className="mb-4" style={{ maxWidth: 480, margin: "auto" }}>
      <div style={cardStyle}>
        <div style={overlay}></div>

        {form.logo && (
          <img src={form.logo} alt="Logo" style={logoStyle} />
        )}

        <div style={infoStyle}>
          <h2 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
            {form.shopName}
          </h2>
          <p>{label("Owner")}: {form.ownerName}</p>
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
            borderRadius: "10px",
            padding: "0.6rem 1.5rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
          onClick={onShare}
        >
          📲 Share Card Detail's
        </button>
      </div>
    </div>
  );
}
