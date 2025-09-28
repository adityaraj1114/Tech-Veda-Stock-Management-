// src/pages/CustomerDetails.jsx
import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCustomer } from "../context/CustomerContext";
import { useSales } from "../context/SalesContext";
import BillPreview from "../components/BillPreview";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";

export default function CustomerDetails() {
  const { id } = useParams();
  const { customers, recordPayment } = useCustomer();
  const { sales, updateSalePayment } = useSales();

  const [showBillFor, setShowBillFor] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const cust = customers.find((c) => String(c.id) === String(id));
  if (!cust) return <p className="text-danger">Customer not found 🚫</p>;

  // ✅ Group sales by transaction (customer + date) with proper discount & GST
  const customerSales = useMemo(() => {
    const grouped = [];
    const map = {};

    sales
      .filter((s) => s.customer === cust.name)
      .forEach((s) => {
        const txKey = `${s.date}_${cust.id}`;
        if (!map[txKey]) {
          map[txKey] = {
            id: txKey,
            date: s.date,
            customer: cust.name,
            items: [],
            subtotal: 0,
            discount: 0,
            gstRate: s.gstRate || 0,
            gstAmount: 0,
            totalAmount: 0,
            paid: 0,
            pending: 0,
            customerInfo: s.customerInfo || {},
          };
          grouped.push(map[txKey]);
        }

        const qty = Number(s.quantity || 0);
        const unitPrice = Number(s.sellingPrice || s.unitPrice || 0);
        const itemDiscount = Number(s.discount || 0); // ✅ use as absolute value
        const gstPct = Number(s.gstRate || 0);

        const itemSubtotal = qty * unitPrice;
        const afterDiscount = itemSubtotal - itemDiscount;
        const itemGst = (gstPct / 100) * afterDiscount;
        const itemTotal = afterDiscount + itemGst;

        map[txKey].items.push({
          product: s.product,
          quantity: qty,
          unitPrice,
          discount: itemDiscount,
          gst: itemGst,
          total: itemTotal,
        });

        map[txKey].subtotal += itemSubtotal;
        map[txKey].discount += itemDiscount;
        map[txKey].gstAmount += itemGst;
        map[txKey].totalAmount += itemTotal;
        map[txKey].paid += s.paid || 0;
        map[txKey].pending += itemTotal - (s.paid || 0);
      });

    return grouped;
  }, [sales, cust]);

  // ✅ Filter by date
  const filteredSales = useMemo(() => {
    return customerSales.filter((tx) =>
      searchDate ? tx.date.startsWith(searchDate) : true
    );
  }, [customerSales, searchDate]);

  // ✅ Pagination
  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, currentPage]);

  // ✅ Totals
  const totalPurchased = customerSales.reduce(
    (sum, s) => sum + s.totalAmount,
    0
  );
  const totalPaid = customerSales.reduce((sum, s) => sum + (s.paid || 0), 0);
  const totalPending = totalPurchased - totalPaid;

  const displayInfo = {
    name: cust.name,
    billingAddress: cust.billingAddress || "— Not Provided",
    shippingAddress: cust.shippingAddress || "— Not Provided",
    contactPhone: cust.contactPhone || "— Not Provided",
    gstin: cust.gstin || "— Not Provided",
  };

  // ✅ Notify on WhatsApp
  const notifyOnWhatsApp = () => {
    if (!cust.contactPhone) {
      alert("Customer phone number not available for WhatsApp.");
      return;
    }
    const phone = cust.contactPhone.replace(/\D/g, "");
    const message = `Hello ${cust.name},

Here is your account summary:
Total Purchased: ₹${totalPurchased.toFixed(2)}
Paid: ₹${totalPaid.toFixed(2)}
Pending: ₹${totalPending.toFixed(2)}

Thank you!`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // ✅ Record Payment
  const handleRecordPayment = () => {
    const amt = parseFloat(prompt("Enter payment amount (₹):"));
    if (!isNaN(amt) && amt > 0) {
      let remaining = amt;

      const updatedSales = sales.map((s) => {
        if (s.customer !== cust.name) return s;

        const pending = (s.totalAmount || s.total) - (s.paid || 0);
        if (pending <= 0) return s;

        const payNow = remaining >= pending ? pending : remaining;
        remaining -= payNow;

        return {
          ...s,
          paid: parseFloat(((s.paid || 0) + payNow).toFixed(2)),
          pending: parseFloat((pending - payNow).toFixed(2)),
        };
      });

      updateSalePayment(updatedSales);
      recordPayment(cust.id, amt, customers);
      alert(`Payment of ₹${amt.toFixed(2)} recorded successfully!`);
    } else {
      alert("Invalid amount entered!");
    }
  };

  // ✅ Delete Transaction
  const handleDeleteTx = (txKey) => {
    if (!window.confirm("Delete this entire transaction?")) return;
    const [date, customerId] = txKey.split("_");
    const updated = sales.filter(
      (s) => !(s.customer === cust.name && s.date === date)
    );
    updateSalePayment(updated);
  };

  // ✅ Share Bill on WhatsApp
  const shareBillOnWhatsApp = (tx) => {
    const text = `🧾 Bill for ${tx.customer}
Date: ${tx.date}

${tx.items
  .map(
    (it, i) =>
      `${i + 1}. ${it.product} x${it.quantity} @₹${it.unitPrice} 
Discount: ₹${it.discount.toFixed(2)} GST: ₹${it.gst.toFixed(2)} 
= ₹${it.total.toFixed(2)}`
  )
  .join("\n")}

Subtotal: ₹${tx.subtotal.toFixed(2)}
Total Discount: ₹${tx.discount.toFixed(2)}
GST: ₹${tx.gstAmount.toFixed(2)}
Total: ₹${tx.totalAmount.toFixed(2)}
Paid: ₹${tx.paid.toFixed(2)}
Pending: ₹${tx.pending.toFixed(2)}

📍 Address: ${tx.customerInfo.billingAddress || "N/A"}
📦 Shipping: ${tx.customerInfo.shippingAddress || "N/A"}
📞 Phone: ${tx.customerInfo.contactPhone || "N/A"}
GSTIN: ${tx.customerInfo.gstin || "N/A"}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // ✅ Download Bill PDF
  const downloadBillPDF = (tx) => {
    const el = document.getElementById(`bill_${tx.id}`);
    if (!el) return;
    const opt = {
      margin: 0.5,
      filename: `Bill_${tx.customer}_${tx.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf()
      .set(opt)
      .from(el)
      .save()
      .catch((err) => console.error(err));
  };

  // ✅ Export CSV & Excel
  const exportCSV = () => {
    const data = filteredSales.map((tx) => ({
      Date: tx.date,
      Subtotal: tx.subtotal.toFixed(2),
      Discount: tx.discount.toFixed(2),
      GST: tx.gstAmount.toFixed(2),
      Total: tx.totalAmount.toFixed(2),
      Paid: tx.paid.toFixed(2),
      Pending: tx.pending.toFixed(2),
    }));
    saveAs(
      new Blob([Papa.unparse(data)], { type: "text/csv;charset=utf-8;" }),
      `customer_${cust.name}_transactions.csv`
    );
  };

  const exportExcel = () => {
    const data = filteredSales.map((tx) => ({
      Date: tx.date,
      Subtotal: tx.subtotal.toFixed(2),
      Discount: tx.discount.toFixed(2),
      GST: tx.gstAmount.toFixed(2),
      Total: tx.totalAmount.toFixed(2),
      Paid: tx.paid.toFixed(2),
      Pending: tx.pending.toFixed(2),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    saveAs(
      new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `customer_${cust.name}_transactions.xlsx`
    );
  };

  return (
    <div className="container p-0 mb-5">
      <motion.div
        className="card shadow p-1 rounded-4"
        style={{
          // background: "linear-gradient(135deg, #091257ff 0%, #2505c2ff 100%)",
          background: "linear-gradient(135deg, #a0f2fbff 0%, #fbd6f6ff 100%)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="mb-3 pt-4 text-center text-dark">📋 Customer Details</h2>

        {/* Customer Info */}
        <motion.div
          className="card mb-4 p-3 bg-light border rounded-3 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #6ae4faff 0%, #e1ff75ff 100%)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="text-primary pb-1 text-center">
            <b>{displayInfo.name}</b>
          </h4>
          <p>
            🏠 <strong>Billing Address:</strong> {displayInfo.billingAddress}
          </p>
          <p>
            📦 <strong>Shipping Address:</strong> {displayInfo.shippingAddress}
          </p>
          <p>
            📞 <strong>Phone:</strong> <b>{displayInfo.contactPhone}</b>
          </p>
          <p>
            🧾 <strong>GSTIN:</strong> {displayInfo.gstin}
          </p>
        </motion.div>

        {/* Summary */}
        <motion.div
          className="row mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="col-md-6">
            <motion.div
              className="border p-3 rounded bg-white shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, #6ae4faff 0%, #e1ff75ff 100%)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/** Calculate totals correctly */}
              {(() => {
                let totalPurchased = 0;
                let totalPaid = 0;

                filteredSales.forEach((b) => {
                  const discountAmount = (b.subtotal * (b.discount || 0)) / 100;
                  const total = b.subtotal - discountAmount + b.gstAmount;
                  totalPurchased += total;
                  totalPaid += b.paid || 0;
                });

                const totalPending = totalPurchased - totalPaid;

                return (
                  <>
                    <p className="fs-5 text-dark pt-2 pb-2 m-2">
                      <strong>Total Purchased:</strong> ₹
                      {totalPurchased.toFixed(2)}
                    </p>
                    <p className="fs-5 text-green pt-2 pb-2 m-2">
                      <strong>Paid:</strong> ₹{totalPaid.toFixed(2)}
                    </p>
                    <p className="fs-5 text-dark pt-2 pb-2 m-2">
                      <strong>Pending:</strong>{" "}
                      <span className="text-danger fw-bold">
                        ₹{totalPending.toFixed(2)}
                      </span>
                    </p>
                  </>
                );
              })()}
            </motion.div>

            {totalPending > 0 && (
              <div className="mt-3 px-5">
                <button
                  className="btn btn-success w-100"
                  onClick={handleRecordPayment}
                >
                  💵 Record Payment
                </button>
              </div>
            )}

            <div className="mt-3 px-5">
              <button
                className="btn btn-success w-100"
                onClick={notifyOnWhatsApp}
              >
                📲 Notify on WhatsApp
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bill Preview Modal */}

        <div className="p-0">
          {showBillFor && (
            <BillPreview
              shareBillOnWhatsApp={shareBillOnWhatsApp}
              downloadBillPDF={downloadBillPDF}
              setShowBillFor={setShowBillFor}
              showBillFor={showBillFor}
              transactions={customerSales}
              tx={customerSales.find((b) => b.id === showBillFor)}
            />
          )}
        </div>

        {/* Transactions Table */}
        <h5 className="mt-4 mb-3 px-3 text-primary">
          <b>📑 Transactions</b>
        </h5>
        <div className="row g-2 mb-2">
          <div className="col-md-auto d-flex align-items-center gap-2">
            <div className="col-md-4">
              <input
                type="date"
                className="form-control"
                value={searchDate}
                onChange={(e) => {
                  setSearchDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button
              className="btn btn-outline-success"
              onClick={exportCSV}
              disabled={!filteredSales.length}
            >
              📥 CSV
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={exportExcel}
              disabled={!filteredSales.length}
            >
              📊 Excel
            </button>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <p className="text-muted">No transactions found 🚫</p>
        ) : (
          <div className="table-responsive pb-5">
            <table className="table table-striped table-bordered shadow-sm">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Subtotal (₹)</th>
                  <th>Discount (₹)</th>
                  <th>GST (₹)</th>
                  <th>Total (₹)</th>
                  <th>Paid (₹)</th>
                  <th>Pending (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map((bill, i) => {
                  const discountAmount =
                    (bill.subtotal * (bill.discount || 0)) / 100;
                  const totalAmount =
                    bill.subtotal - discountAmount + bill.gstAmount;
                  const pendingAmount = totalAmount - bill.paid;

                  return (
                    <tr key={bill.id}>
                      <td>{(currentPage - 1) * pageSize + i + 1}</td>
                      <td>{bill.date}</td>
                      <td>₹{bill.subtotal.toFixed(2)}</td>
                      <td>₹{discountAmount.toFixed(2)}</td>
                      <td>₹{bill.gstAmount.toFixed(2)}</td>
                      <td>₹{totalAmount.toFixed(2)}</td>
                      <td className="text-success">₹{bill.paid.toFixed(2)}</td>
                      <td className="text-danger">
                        ₹{pendingAmount.toFixed(2)}
                      </td>
                      <td className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => setShowBillFor(bill.id)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteTx(bill.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="table-secondary fw-bold">
                <tr>
                  <td colSpan={2} className="text-end">
                    TOTAL
                  </td>
                  <td>
                    ₹
                    {filteredSales
                      .reduce((sum, b) => sum + b.subtotal, 0)
                      .toFixed(2)}
                  </td>
                  <td>
                    ₹
                    {filteredSales
                      .reduce(
                        (sum, b) =>
                          sum + (b.subtotal * (b.discount || 0)) / 100,
                        0
                      )
                      .toFixed(2)}
                  </td>
                  <td>
                    ₹
                    {filteredSales
                      .reduce((sum, b) => sum + b.gstAmount, 0)
                      .toFixed(2)}
                  </td>
                  <td>
                    ₹
                    {filteredSales
                      .reduce((sum, b) => {
                        const discount = (b.subtotal * (b.discount || 0)) / 100;
                        return sum + (b.subtotal - discount + b.gstAmount);
                      }, 0)
                      .toFixed(2)}
                  </td>
                  <td className="text-success">
                    ₹
                    {filteredSales
                      .reduce((sum, b) => sum + b.paid, 0)
                      .toFixed(2)}
                  </td>
                  <td className="text-danger">
                    ₹
                    {filteredSales
                      .reduce((sum, b) => {
                        const discount = (b.subtotal * (b.discount || 0)) / 100;
                        const total = b.subtotal - discount + b.gstAmount;
                        return sum + (total - b.paid);
                      }, 0)
                      .toFixed(2)}
                  </td>
                  <td>—</td>
                </tr>
              </tfoot>
            </table>

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-outline-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ⬅️ Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-outline-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next ➡️
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
