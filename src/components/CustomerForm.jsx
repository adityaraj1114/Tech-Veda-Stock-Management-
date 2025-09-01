// src/components/CustomerForm.jsx
import React from "react";

export default function CustomerForm({ customerInfo, setCustomerInfo }) {
  const onChange = e => {
    const { name, value } = e.target;
    setCustomerInfo(ci => ({ ...ci, [name]: value }));
  };

  return (
    <div className="card shadow-sm p-3 mb-4">
      <h5>👤 Customer Details</h5>
      <div className="row g-2">
        <div className="col-md-6">
          <input
            name="name"
            value={customerInfo.name}
            onChange={onChange}
            className="form-control"
            placeholder="Name"
            required
          />
        </div>
        <div className="col-md-6">
          <input
            name="gstin"
            value={customerInfo.gstin}
            onChange={onChange}
            className="form-control"
            placeholder="GSTIN (optional)"
          />
        </div>
        <div className="col-12">
          <input
            name="billingAddress"
            value={customerInfo.billingAddress}
            onChange={onChange}
            className="form-control"
            placeholder="Billing Address (optional)"
            // placeholder="Shipping Address (optional)"
          />
        </div>
        {/* <div className="col-12">
          <input
            name="shippingAddress"
            value={customerInfo.shippingAddress}
            onChange={onChange}
            className="form-control"
            placeholder="Shipping Address (optional)"
          />
        </div> */}
        
        <div className="col-md-6">
          <input
            name="contactPhone"
            value={customerInfo.contactPhone}
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
