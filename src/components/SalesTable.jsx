import React, { useState } from "react";
import html2pdf from "html2pdf.js";


const SalesTable = ({ sales, deleteSale }) => {
  const [selectedSale, setSelectedSale] = useState(null);
  const items = Array.isArray(selectedSale?.items)
  ? selectedSale.items
  : [selectedSale];

  const handleView = (sale) => {
    setSelectedSale(sale);
  };

  if (!Array.isArray(sales)) {
    return <p className="text-danger">Sales data is not available.</p>;
  }

  return (
    <div className="table-responsive">
      <h5 className="mb-3">📄 Transactions</h5>
      <table className="table table-bordered table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>No.</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Total Amount (₹)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s, i) => (
            <tr key={s.id}>
              <td>{i + 1}</td>
              <td>{s.date}</td>
              <td>{s.customer}</td>
              <td className="fw-bold text-success">
                ₹{s.items ? s.items.reduce((sum, item) => sum + item.total, 0) : s.totalAmount}
              </td>
              <td>
                <button
                  onClick={() => handleView(s)}
                  className="btn btn-sm btn-info me-2"
                >
                  👁️ View
                </button>
                <button
                  onClick={() => deleteSale(s.id)}
                  className="btn btn-sm btn-danger"
                >
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bill Preview */}
      {selectedSale && (
        <div className="mt-4 border p-4 bg-white">
          <h4>🧾 Bill for {selectedSale.customer}</h4>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(selectedSale.items || [selectedSale]).map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item.product}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.unitPrice}</td>
                  <td>₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h5 className="text-end mt-3">
            Grand Total: ₹
            {(selectedSale.items || [selectedSale]).reduce(
              (sum, item) => sum + item.total,
              0
            )}
          </h5>
        </div>
      )}
    </div>
  );
};

export default SalesTable;
