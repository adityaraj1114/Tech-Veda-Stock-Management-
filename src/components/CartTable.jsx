import React, { useState } from "react";
import html2pdf from "html2pdf.js";
import PdfDownloader from "../components/PdfDownloader";

const CartTable = ({ cart, removeFromCart, handleFinalizeSale, customer }) => {
  const [showBill, setShowBill] = useState(false);

  const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);

  const generateBillText = () => {
    let bill = `🧾 Bill for ${customer}\n\n`;
    cart.forEach((item, i) => {
      bill += `${i + 1}. ${item.product} x${item.quantity} @₹${
        item.unitPrice
      } = ₹${item.total}\n`;
    });
    bill += `\nTOTAL = ₹${grandTotal}`;
    return bill;
  };

  const shareOnWhatsApp = () => {
    const billText = generateBillText();
    const url = `https://wa.me/?text=${encodeURIComponent(billText)}`;
    window.open(url, "_blank");
  };

    const downloadPDF = () => {
      const element = document.getElementById("bill-preview");
      const opt = {
        margin: 0.5,
        filename: `Bill_${customer}_${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };
      window.html2pdf().set(opt).from(element).save();
    };

  const finalizeAndShowBill = () => {
    handleFinalizeSale();
    setShowBill(true);
  };

  return (
    <div className="mb-3">
      <h5>🛒 Cart</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{item.product}</td>
              <td>{item.quantity}</td>
              <td>₹{item.unitPrice}</td>
              <td>₹{item.total}</td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => removeFromCart(i)}
                >
                  ❌ Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex gap-2">
        <button onClick={finalizeAndShowBill} className="btn btn-success">
          ✅ Finalize Sale
        </button>
      </div>


    </div>
  );
};

export default CartTable;
