// src/components/BillPreview.jsx
import React, { useState } from "react";
import { useProfile } from "../context/ProfileContext";
import html2canvas from "html2canvas";

export default function BillPreview({
  downloadBillPDF,
  setShowBillFor,
  showBillFor,
  transactions,
}) {
  const { profile } = useProfile();
  const shopName = profile?.shopName || "My Shop";

  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Currency formatter
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  // Find current transaction
  const currentTx = transactions.find((t) => t.id === showBillFor);
  if (!showBillFor || !currentTx) return null;

  // Row-wise calculation
  const calculateRow = (it) => {
    const qty = Number(it.quantity) || 0;
    const price = Number(it.sellingPrice || it.unitPrice) || 0;
    const discount = Number(it.discount) || 0;
    const gst = Number(it.gst) || 0;

    const netPrice = qty * price;
    const discountAmt = (discount / 100) * netPrice;
    const afterDiscount = netPrice - discountAmt;
    const gstAmt = (gst / 100) * afterDiscount;
    const finalTotal = afterDiscount + gstAmt;

    return {
      qty,
      price,
      netPrice,
      discount,
      discountAmt,
      gst,
      gstAmt,
      finalTotal,
    };
  };

  // Totals
  let totalQty = 0,
    subTotal = 0,
    totalDiscount = 0,
    totalGST = 0,
    grandTotal = 0;

  currentTx.items?.forEach((it) => {
    const { qty, netPrice, discountAmt, gstAmt, finalTotal } = calculateRow(it);
    totalQty += qty;
    subTotal += netPrice;
    totalDiscount += discountAmt;
    totalGST += gstAmt;
    grandTotal += finalTotal;
  });

  const paid =
    typeof currentTx.paid === "number"
      ? currentTx.paid
      : currentTx.items?.reduce((sum, it) => sum + (it.paid || 0), 0) || 0;

  const pending = grandTotal - paid;

  // ✅ WhatsApp share with bill image and entered number
  const shareBillImageOnWhatsApp = async () => {
    try {
      const element = document.getElementById(`bill_${currentTx.id}`);
      if (!element) return;

      const canvas = await html2canvas(element, { scale: 2 });
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) {
        alert("❌ Failed to generate bill image");
        return;
      }

      const file = new File([blob], `Invoice_${currentTx.id}.png`, {
        type: "image/png",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice from ${shopName}`,
          text: `Here is your invoice from ${shopName}.`,
          files: [file],
        });
      } else {
        // fallback: open whatsapp web with text only using entered number
        const phone = whatsappNumber || currentTx.customerInfo?.contactPhone;
        if (phone) {
          const whatsappUrl = `https://wa.me/91${phone}?text=Here is your invoice from ${shopName}. (Image may not be attached automatically)`;
          window.open(whatsappUrl, "_blank");
        } else {
          alert("⚠️ Please enter WhatsApp number!");
        }
      }
    } catch (err) {
      console.error("WhatsApp share failed:", err);
    }
  };

  return (
    <>
      <div
        id={`bill_${currentTx.id}`}
        className="border bg-white pt-3 p-3 mb-4 shadow mt-5 rounded"
        style={{
          maxWidth: "800px",
          margin: "auto",
          fontSize: "0.85rem",
          overflow: "hidden",
        }}
      >
        {/* Shop Details Header */}
        <div className="text-center border-bottom pb-2 mb-2">
          <h4 className="mb-1 fw-bold text-primary">{shopName}</h4>
          <p className="mb-0" style={{ fontSize: "0.8rem" }}>
            <b>Address: </b>
            {[
              profile?.addressLine1 || "Shop Address",
              profile?.addressLine2,
              profile?.city,
              profile?.state,
              profile?.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          <p className="mb-1" style={{ fontSize: "0.8rem" }}>
            📞 {profile?.phone || "-"} | <b>GSTIN:</b> {profile?.gstin || "-"}
          </p>
          <small className="text-muted">Tax Invoice</small>
        </div>

        {/* Invoice Meta Info */}
        <div
          className="d-flex justify-content-between mb-1"
          style={{ fontSize: "0.7rem" }}
        >
          <span>Invoice ID: {currentTx.id}</span>
          <span>Date: {currentTx.date}</span>
        </div>
        <div className="mb-2" style={{ fontSize: "0.8rem", lineHeight: "1.1" }}>
          <p className="mb-1">
            <b>Customer:</b> {currentTx.customer}
          </p>
          <p className="mb-1">
            <b>Phone:</b> {currentTx.customerInfo?.contactPhone || "-"}
          </p>
          <p className="mb-0">
            <b>Address:</b> {currentTx.customerInfo?.billingAddress || "-"}
          </p>
        </div>

        {/* Items Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="table table-sm table-bordered text-center align-middle mb-2">
            <thead className="table-light" style={{ fontSize: "0.8rem" }}>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Selling Price</th>
                <th>Dis %</th>
                <th>GST</th>
                <th>Final Total</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "0.75rem" }}>
              {currentTx.items?.map((it, i) => {
                const { qty, price, discount, gst, finalTotal } = calculateRow(it);
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{it.product}</td>
                    <td>{qty}</td>
                    <td>{formatCurrency(price)}</td>
                    <td>
                      {discount}% ({formatCurrency((discount / 100) * qty * price)})
                    </td>
                    <td>
                      {gst}% (
                      {formatCurrency(
                        (gst / 100) * (qty * price - (discount / 100) * qty * price)
                      )}
                      )
                    </td>
                    <td className="text-end fw-semibold">
                      {formatCurrency(finalTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Totals */}
            <tfoot
              className="table-secondary fw-semibold"
              style={{ fontSize: "0.75rem" }}
            >
              <tr>
                <td colSpan={2} className="text-end">
                  TOTAL
                </td>
                <td>{totalQty}</td>
                <td>{formatCurrency(subTotal)}</td>
                <td>{formatCurrency(totalDiscount)}</td>
                <td>{formatCurrency(totalGST)}</td>
                <td className="text-end">{formatCurrency(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Totals Section */}
        <div className="text-end mt-2" style={{ fontSize: "0.8rem" }}>
          <div>Sub Total: {formatCurrency(subTotal)}</div>
          <div className="text-danger">
            Discount: -{formatCurrency(totalDiscount)}
          </div>
          <div className="text-primary">GST: +{formatCurrency(totalGST)}</div>
          <h6 className="fw-bold">
            <b>Grand Total :</b> {formatCurrency(grandTotal)}
          </h6>
          <div className="text-success">
            <b>Paid :</b> {formatCurrency(paid)}
          </div>
          <div className="text-danger">
            <b>Pending :</b> {formatCurrency(pending)}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-top mt-3 pt-2">
          <p className="mb-0" style={{ fontSize: "0.75rem" }}>
            Thank you for shopping with <b>{shopName}</b>!
          </p>
          <small className="text-muted">
            This is a computer-generated invoice and does not require a
            signature.
          </small>
        </div>
      </div>

      {/* WhatsApp Input + Actions */}
      <div className="d-flex flex-column align-items-center gap-2 mt-2">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Enter WhatsApp number (without +91)"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          style={{ maxWidth: "300px" }}
        />
        <div className="d-flex gap-2">
          <button
            className="btn btn-success btn-sm"
            onClick={shareBillImageOnWhatsApp}
          >
            📲 WhatsApp
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => downloadBillPDF(currentTx)}
          >
            📄 PDF
          </button>
          <button
            className="btn btn-outline-dark btn-sm"
            onClick={() => setShowBillFor(null)}
          >
            ❌ Close
          </button>
        </div>
      </div>
    </>
  );
}
