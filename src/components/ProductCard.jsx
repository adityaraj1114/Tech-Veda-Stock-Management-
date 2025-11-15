import React from "react";

/**
 * Props:
 * - product: product object
 * - selectedQty: number (0 if not selected)
 * - onAdd(): add one to cart when first selected
 * - onQtyChange(newQty): quantity change
 * - onRemove(): remove product from cart
 *
 * This works for:
 * - Purchase Page (purchase items show in card)
 * - Retail Sale Page (selected sale items show in card)
 */
export default function ProductCard({
  product,
  selectedQty = 0,
  onAdd,
  onQtyChange,
  onRemove,
}) {
  // Placeholder clean image
  const placeholder =
    product.image && product.image !== ""
      ? product.image
      : `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
            <rect width='100%' height='100%' fill='#f0f0f0'/>
            <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
              fill='#bbb' font-size='20'>No image</text>
           </svg>`
        )}`;

  // Handle card click
  const handleCardClick = () => {
    if (selectedQty === 0) {
      onAdd(); // add first time
    } else if (selectedQty < (product.stock || Infinity)) {
      onQtyChange(selectedQty + 1); // increase qty
    }
  };

  return (
    <div
      className={`card h-100 shadow-sm ${
        selectedQty > 0 ? "border-primary" : ""
      }`}
      style={{
        cursor: "pointer",
        transition: "transform 0.2s ease",
      }}
      onClick={handleCardClick}
    >
      {/* IMAGE */}
      <img
        src={placeholder}
        alt={product.name}
        style={{
          height: 160,
          width: "100%",
          objectFit: "cover",
          borderTopLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
        }}
      />

      {/* NAME + PRICE + STOCK */}
      <div className="card-body">
        <h6 className="card-title text-truncate fw-semibold">{product.name}</h6>

        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold text-success">
            ₹{Number(product.sellingPrice).toFixed(2)}
          </div>

          <div className="text-muted small">
            Stock: {product.stock ?? 0}
          </div>
        </div>

        {/* PURCHASE PRICE SHOW (Only when product has buyingPrice) */}
        {product.buyingPrice ? (
          <div className="text-muted small mt-1">
            Purchase Price: ₹{Number(product.buyingPrice).toFixed(2)}
          </div>
        ) : null}
      </div>

      {/* QUANTITY CONTROLS (ONLY when selected) */}
      {selectedQty > 0 && (
        <div className="card-footer d-flex justify-content-between gap-1 align-items-center p-1 pb-2">
          <div className="btn-group gap-1 btn-group-sm" role="group">
            {/* - button */}
            <button
              className="btn btn-outline-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onQtyChange(Math.max(0, selectedQty - 1));
              }}
            >
              −
            </button>

            {/* QTY display */}
            <button
              className="btn btn-light"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedQty}
            </button>

            {/* + button */}
            <button
              className="btn btn-outline-secondary"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedQty < (product.stock || Infinity)) {
                  onQtyChange(selectedQty + 1);
                }
              }}
            >
              +
            </button>
          </div>

          {/* REMOVE */}
          <button
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
