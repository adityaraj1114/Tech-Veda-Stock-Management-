// src/components/BillModal.jsx
import React from "react";

const BillModal = ({ isOpen, onClose, customer }) => {
  if (!isOpen || !customer) return null;

  const totalPaid = customer.installments?.reduce(
    (sum, inst) => sum + inst.amount,
    0
  );
  const pending = customer.totalAmount - totalPaid;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[600px] max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-gray-700">
            Bill - {customer.name}
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 font-semibold hover:text-red-700"
          >
            ✕
          </button>
        </div>

        {/* Customer Info */}
        <div className="mt-4 space-y-1 text-gray-700">
          <p>
            <span className="font-semibold">Mobile:</span> {customer.mobile}
          </p>
          <p>
            <span className="font-semibold">Address:</span> {customer.address}
          </p>
          <p>
            <span className="font-semibold">Date:</span> {customer.date}
          </p>
        </div>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-blue-100 rounded-lg py-2">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-lg font-bold">₹{customer.totalAmount}</p>
          </div>
          <div className="bg-green-100 rounded-lg py-2">
            <p className="text-sm text-gray-600">Paid</p>
            <p className="text-lg font-bold">₹{totalPaid}</p>
          </div>
          <div className="bg-red-100 rounded-lg py-2">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-lg font-bold">₹{pending}</p>
          </div>
        </div>

        {/* Installments Table */}
        <h3 className="mt-6 mb-2 text-gray-700 font-semibold">
          Installment History
        </h3>
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {customer.installments?.map((inst, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{inst.date}</td>
                <td className="px-3 py-2">₹{inst.amount}</td>
              </tr>
            ))}
            {(!customer.installments || customer.installments.length === 0) && (
              <tr>
                <td
                  colSpan="3"
                  className="px-3 py-2 text-center text-gray-500 italic"
                >
                  No installments added
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillModal;
