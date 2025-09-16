import React from "react";
import { useCustomer } from "../context/CustomerContext";

export default function CustomerForm() {
  const { customerInfo, setCustomerInfo } = useCustomer();

  const onChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card shadow-sm p-3 mb-4">
      <h5>👤 Customer Details</h5>
      <div className="row g-2">
        {/* Name */}
        <div className="col-md-6">
          <input
            type="text"
            name="name"
            value={customerInfo?.name || ""}
            onChange={onChange}
            className="form-control"
            placeholder="Name"
            required
          />
        </div>

        {/* GSTIN */}
        <div className="col-md-6">
          <input
            type="text"
            name="gstin"
            value={customerInfo?.gstin || ""}
            onChange={onChange}
            className="form-control"
            placeholder="GSTIN (optional)"
          />
        </div>

        {/* Billing Address */}
        <div className="col-12">
          <input
            type="text"
            name="billingAddress"
            value={customerInfo?.billingAddress || ""}
            onChange={onChange}
            className="form-control"
            placeholder="Billing Address (optional)"
          />
        </div>

        {/* Shipping Address */}
        <div className="col-12">
          <input
            type="text"
            name="shippingAddress"
            value={customerInfo?.shippingAddress || ""}
            onChange={onChange}
            className="form-control"
            placeholder="Shipping Address (optional)"
          />
        </div>

        {/* Contact Phone */}
        <div className="col-md-6">
          <input
            type="tel"
            name="contactPhone"
            value={customerInfo?.contactPhone || ""}
            onChange={onChange}
            className="form-control"
            placeholder="Contact Phone"
            required
          />
        </div>
      </div>
    </div>
  );
}
