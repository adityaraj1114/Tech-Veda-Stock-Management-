import React from "react";

export default function VisitingCard({ form, previewVisible, onShare }) {
  if (!previewVisible) return null;

  const gradientStyle = {
    background: "linear-gradient(90deg, #0f2027, #2c5364, #ff6e7f)",
    color: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    maxWidth: "100%",
    minHeight: "160px",
  };

  const logoStyle = {
    height: 60,
    marginRight: "1rem",
    borderRadius: "8px",
    objectFit: "contain",
    backgroundColor: "white",
    padding: "0.5rem",
  };

  const infoStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    // alignItems: "center",
    gap: "1px",
  };

  const label = (text) => <strong style={{ color: "#ffd700" }}>{text}</strong>;

  return (
    <div className="mb-4" style={{ maxWidth: 700, margin: "auto" }}>
      <div style={gradientStyle}>
        <div
          className="d-flex align-items-center"
          style={{ gap: "1rem", flex: 1 }}
        >
          {/* {form.logo && <img src={form.logo} alt="Logo" style={logoStyle} />} */}
          <div style={infoStyle}>
          {/* {form.logo && <img className="h-50 w-50" src={form.logo} alt="Logo" style={logoStyle} />} */}
            <h4 style={{ marginBottom: "0.5rem" }}>{form.shopName}</h4>
            <p>
              {label("Owner")}: {form.ownerName}
            </p>
            <p>
              {label("Phone")}: {form.phone}
            </p>
            <p>
              {label("Email")}: {form.email}
            </p>
            <p>
              {label("Address")}: {form.addressLine1}, {form.city}, {form.state}{" "}
              – {form.pincode}
            </p>
            {form.gstin && (
              <p>
                {label("GSTIN")}: {form.gstin}
              </p>
            )}
            {form.website && (
              <p>
                {label("Website")}: {form.website}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex align-item-center justify-content-center pt-4">
        <button className="btn btn-md btn-light" onClick={onShare}>
          📲 Share
        </button>
      </div>
    </div>
  );
}
