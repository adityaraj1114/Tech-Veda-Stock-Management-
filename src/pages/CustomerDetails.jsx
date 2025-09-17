import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCustomer } from "../context/CustomerContext";
import { useSales } from "../context/SalesContext";
import BillPreview from "../components/BillPreview";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

  const customerSales = useMemo(() => {
    const grouped = [];
    const map = {};

    sales
      .filter((s) => s.customer === cust.name)
      .forEach((s) => {
        const txKey = s.date + "_" + cust.id;
        if (!map[txKey]) {
          map[txKey] = {
            id: txKey,
            date: s.date,
            items: [],
            totalAmount: 0,
            paid: 0,
            pending: 0,
            customerInfo: s.customerInfo || {},
          };
          grouped.push(map[txKey]);
        }

        map[txKey].items.push({
          product: s.product,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          total: s.total,
        });

        map[txKey].totalAmount += s.total;
        map[txKey].paid += s.paid || 0;
        map[txKey].pending += s.total - (s.paid || 0);
      });

    return grouped;
  }, [sales, cust]);

  const filteredSales = useMemo(() => {
    return customerSales.filter((tx) =>
      searchDate ? tx.date === searchDate : true
    );
  }, [customerSales, searchDate]);

  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, currentPage]);

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
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleRecordPayment = () => {
    const amt = parseFloat(prompt("Enter payment amount (₹):"));
    if (!isNaN(amt) && amt > 0) {
      let remaining = amt;

      const updatedSales = sales.map((s) => {
        if (s.customer !== cust.name) return s;

        const pending = s.total - (s.paid || 0);
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

  const handleDeleteTx = (txKey) => {
    if (!window.confirm("Delete this entire transaction?")) return;
    const [date] = txKey.split("_");
    const updated = sales.filter(
      (s) => !(s.customer === cust.name && s.date === date)
    );
    updateSalePayment(updated);

  };

  const exportCSV = () => {
    const data = filteredSales.map((tx) => ({
      Date: tx.date,
      Total: tx.totalAmount.toFixed(2),
      Paid: tx.paid.toFixed(2),
      Pending: (tx.totalAmount - tx.paid).toFixed(2),
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `customer_${cust.name}_transactions.csv`);
  };

  const exportExcel = () => {
    const data = filteredSales.map((tx) => ({
      Date: tx.date,
      Total: tx.totalAmount.toFixed(2),
      Paid: tx.paid.toFixed(2),
      Pending: (tx.totalAmount - tx.paid).toFixed(2),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `customer_${cust.name}_transactions.xlsx`);
  };

  return (
    <div className="container mt-1 p-0">
      <div className="card shadow p-2">
        <h2 className="mb-3">📋 Customer Details</h2>

        <div className="card mb-4 p-3 bg-light border">
          <h4 className="text-primary">{displayInfo.name}</h4>
          <p>
            🏠 <strong>Billing Address:</strong> {displayInfo.billingAddress}
          </p>
          <p>
            📦 <strong>Shipping Address:</strong> {displayInfo.shippingAddress}
          </p>
          <p>
            📞 <strong>Phone:</strong> {displayInfo.contactPhone}
          </p>
          <p>
            🧾 <strong>GSTIN:</strong> {displayInfo.gstin}
          </p>
          <button
            className="btn btn-sm btn-success mt-2"
            onClick={notifyOnWhatsApp}
          >
            📲 Notify on WhatsApp
          </button>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="border p-3 rounded bg-white shadow-sm">
              <p>
                <strong>Total Purchased:</strong> ₹{totalPurchased.toFixed(2)}
              </p>
              <p>
                <strong>Paid:</strong> ₹{totalPaid.toFixed(2)}
              </p>
              <p>
                <strong>Pending:</strong>{" "}
                <span className="text-danger fw-bold">
                  ₹{totalPending.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {showBillFor && (
          <BillPreview
            shareBillOnWhatsApp={(bill) =>
              alert(`Bill #${bill.id} shared on WhatsApp!`)
            }
            downloadBillPDF={(bill) =>
              alert(`Bill #${bill.id} downloaded as PDF!`)
            }
            setShowBillFor={setShowBillFor}
            showBillFor={showBillFor}
            transactions={customerSales}
            tx={customerSales.find((b) => b.id === showBillFor)}
          />
        )}

        <h5 className="mt-4">📑 Transactions</h5>

        <div className="row g-2 mb-3">
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
          <div className="col-md-auto d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-success"
              onClick={exportCSV}
              disabled={!filteredSales.length}
            >
              📥 Export CSV
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={exportExcel}
              disabled={!filteredSales.length}
            >
              📊 Export Excel
            </button>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <p className="text-muted">No transactions found 🚫</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="table-primary">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Total (₹)</th>
                  <th>Paid (₹)</th>
                  <th>Pending (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map((bill, i) => (
                  <tr key={bill.id}>
                    <td>{(currentPage - 1) * pageSize + i + 1}</td>
                    <td>{bill.date}</td>
                    <td>₹{bill.totalAmount.toFixed(2)}</td>
                    <td className="text-success">₹{bill.paid.toFixed(2)}</td>
                    <td className="text-danger">
                      ₹{(bill.totalAmount - bill.paid).toFixed(2)}
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
                ))}
              </tbody>
              <tfoot className="table-secondary fw-bold">
                <tr>
                  <td colSpan={2} className="text-end">
                    TOTAL
                  </td>
                  <td>
                    ₹
                    {filteredSales
                      .reduce((sum, b) => sum + b.totalAmount, 0)
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
                      .reduce((sum, b) => sum + (b.totalAmount - b.paid), 0)
                      .toFixed(2)}
                  </td>
                  <td>—</td>
                </tr>
              </tfoot>
            </table>

            {/* Pagination Controls */}
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

        {/* Record Payment */}
        {totalPending > 0 && (
          <div className="mt-3">
            <button className="btn btn-success" onClick={handleRecordPayment}>
              💵 Record Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
