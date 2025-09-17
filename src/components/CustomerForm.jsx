import React from "react";
import Select from "react-select";
import { useCustomer } from "../context/CustomerContext";

export default function CustomerForm() {
  const { customerInfo, setCustomerInfo, customers } = useCustomer();

  const options = customers.map((c) => ({ value: c.name, label: c.name }));

  // Select handler
  const handleSelect = (selected) => {
    if (!selected) {
      setCustomerInfo({
        name: "",
        gstin: "",
        billingAddress: "",
        shippingAddress: "",
        contactPhone: "",
      });
      return;
    }
    const found = customers.find((c) => c.name === selected.value);
    if (found) {
      setCustomerInfo(found);
    }
  };

  // Input handler
  const onChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card shadow-sm p-3 mb-4">
      <h5>👤 Customer Details</h5>
      <div className="row g-2">
        {/* Dropdown */}
        <div className="col-md-6">
          <Select
            options={options}
            onChange={handleSelect}
            placeholder="Search or select customer"
            isClearable
            value={
              customers.some((c) => c.name === customerInfo?.name)
                ? { value: customerInfo.name, label: customerInfo.name }
                : null
            }
          />
        </div>

        {/* OR Manual Name Input */}
        <div className="col-md-6">
          <input
            type="text"
            name="name"
            value={
              customers.some((c) => c.name === customerInfo?.name)
                ? ""
                : customerInfo?.name || ""
            }
            onChange={(e) => {
              // Clear dropdown selection when typing manually
              setCustomerInfo((prev) => ({
                ...prev,
                name: e.target.value,
              }));
            }}
            className="form-control"
            placeholder="Enter new customer name"
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
