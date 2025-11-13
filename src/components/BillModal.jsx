// src/components/BillModal.jsx
import React, { useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function BillModal({ bill, onClose, shopProfile = {} }) {
  useEffect(() => {}, [bill]);

  if (!bill) return null;

  // ------------------ Currency Formatter ------------------
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  // ------------------ Calculate Row ------------------
  const calculateRow = (it) => {
    const qty = Number(it.qty || 0);
    const sellingPrice = Number(it.sellingPrice || 0);
    const discount = Number(it.discount || 0);
    const gst = Number(it.gst || 0);

    const netPrice = qty * sellingPrice;
    const discountAmt = (discount / 100) * netPrice;
    const afterDiscount = netPrice - discountAmt;
    const gstAmt = (gst / 100) * afterDiscount;
    const finalTotal = afterDiscount + gstAmt;

    return { qty, sellingPrice, discount, gst, netPrice, discountAmt, gstAmt, finalTotal };
  };

  // ------------------ Totals ------------------
  let totalQty = 0,
    subTotal = 0,
    totalDiscount = 0,
    totalGST = 0,
    grandTotal = 0;

  bill.items?.forEach((it) => {
    const { qty, netPrice, discountAmt, gstAmt, finalTotal } = calculateRow(it);
    totalQty += qty;
    subTotal += netPrice;
    totalDiscount += discountAmt;
    totalGST += gstAmt;
    grandTotal += finalTotal;
  });

  const paid = parseFloat(bill.paid || 0);
  const pending = grandTotal - paid;

  // ------------------ PDF Generator ------------------
  const downloadPdf = (b) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Header
    doc.setFontSize(16);
    doc.text(shopProfile.shopName || "Retail Shop", 40, 40);
    doc.setFontSize(10);
    if (shopProfile.shopAddr) doc.text(String(shopProfile.shopAddr), 40, 58);
    if (shopProfile.shopPhone) doc.text(`Phone: ${shopProfile.shopPhone}`, 40, 74);
    if (shopProfile.gstin) doc.text(`GSTIN: ${shopProfile.gstin}`, 40, 90);

    doc.setFontSize(12);
    doc.text(`Bill #: ${b.id}`, 400, 40);
    doc.text(`Date: ${b.dateDisplay || new Date(b.dateISO).toLocaleString()}`, 400, 58);

    // Table
    const body = b.items.map((it, idx) => {
      const row = calculateRow(it);
      return [
        idx + 1,
        it.name || it.product || "-",
        row.qty,
        `₹${row.sellingPrice.toFixed(2)}`,
        `${row.discount}%`,
        `${row.gst}%`,
        `₹${row.finalTotal.toFixed(2)}`,
      ];
    });

    doc.autoTable({
      startY: 110,
      head: [["#", "Item", "Qty", "Price", "Disc%", "GST%", "Total"]],
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(11);

    // Totals
    doc.text(`Sub Total: ₹${subTotal.toFixed(2)}`, 40, finalY);
    doc.text(`Discount: -₹${totalDiscount.toFixed(2)}`, 40, finalY + 16);
    doc.text(`GST: +₹${totalGST.toFixed(2)}`, 40, finalY + 32);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ₹${grandTotal.toFixed(2)}`, 40, finalY + 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Paid: ₹${paid.toFixed(2)}`, 40, finalY + 68);
    doc.text(`Pending: ₹${pending.toFixed(2)}`, 40, finalY + 84);

    // Footer
    doc.setFontSize(9);
    doc.text(
      "Thank you for shopping with us!",
      40,
      finalY + 110
    );
    doc.text("This is a computer-generated invoice.", 40, finalY + 126);

    doc.save(`bill_${b.id}.pdf`);
  };

  // ------------------ UI ------------------
  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">🧾 Bill #{bill.id}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body bg-light">
            <div className="text-center mb-3">
              <h5 className="fw-bold text-primary">
                {shopProfile.shopName || "Retail Shop"}
              </h5>
              <p className="mb-1" style={{ fontSize: "0.85rem" }}>
                {shopProfile.shopAddr || "Shop Address"}
              </p>
              <small>
                📞 {shopProfile.shopPhone || "-"} | GSTIN:{" "}
                {shopProfile.gstin || "-"}
              </small>
              <hr />
              <small className="text-muted">
                Date:{" "}
                {bill.dateDisplay ||
                  new Date(bill.dateISO).toLocaleString()}
              </small>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="table table-sm table-bordered text-center align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>S.P</th>
                    <th>Dis%</th>
                    <th>GST%</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.85rem" }}>
                  {bill.items.map((it, i) => {
                    const row = calculateRow(it);
                    return (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{it.name || it.product}</td>
                        <td>{row.qty}</td>
                        <td>{formatCurrency(row.sellingPrice)}</td>
                        <td>
                          {row.discount}% (
                          {formatCurrency((row.discount / 100) * row.netPrice)})
                        </td>
                        <td>
                          {row.gst}% (
                          {formatCurrency(
                            (row.gst / 100) *
                              (row.netPrice - (row.discount / 100) * row.netPrice)
                          )}
                          )
                        </td>
                        <td className="fw-semibold text-end">
                          {formatCurrency(row.finalTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="table-secondary fw-semibold">
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
            <div className="text-end mt-3 pe-2">
              <div>Sub Total: {formatCurrency(subTotal)}</div>
              <div className="text-danger">
                Discount: -{formatCurrency(totalDiscount)}
              </div>
              <div className="text-primary">
                GST: +{formatCurrency(totalGST)}
              </div>
              <h6 className="fw-bold">
                Grand Total: {formatCurrency(grandTotal)}
              </h6>
              <div className="text-success">Paid: {formatCurrency(paid)}</div>
              <div className="text-danger">Pending: {formatCurrency(pending)}</div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-dark" onClick={onClose}>
              ❌ Close
            </button>
            <button className="btn btn-success" onClick={() => downloadPdf(bill)}>
              📄 Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
