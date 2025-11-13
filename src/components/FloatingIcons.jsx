import React from "react";

export default function FloatingIcons({ selectedCount = 0, onCartClick }) {
  return (
    <div className="position-fixed bottom-0 end-0 m-3 z-3">
      <button
        className="btn btn-dark position-relative rounded-circle"
        style={{ width: 56, height: 56, marginBottom: 86 }}
        onClick={onCartClick}
      >
        <i className="bi bi-cart3 fs-4"></i>
        {selectedCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {selectedCount}
          </span>
        )}
      </button>
    </div>
  );
}
