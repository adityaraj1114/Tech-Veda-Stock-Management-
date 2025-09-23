import React from "react";
import Select from "react-select";
import { useCustomer } from "../context/CustomerContext";
import { motion } from "framer-motion";

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
    <motion.div
      className="card shadow-lg p-4 mb-4 border-0"
      style={{
        // background: "linear-gradient(135deg, #e0f7fa, #e3f2fd, #f3e5f5)",
                background: "linear-gradient(135deg, #0d6efd 0%, #e145f3 100%)",
        borderRadius: "20px",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <h4 className="fw-bold mb-3 text-white d-flex align-items-center">
        👤 Customer Details
      </h4>
      <div className="row g-3">
        {/* Dropdown */}
        <div className="col-md-6">
          <Select
            options={options}
            onChange={handleSelect}
            placeholder="🔎 Search or select customer"
            isClearable
            value={
              customers.some((c) => c.name === customerInfo?.name)
                ? { value: customerInfo.name, label: customerInfo.name }
                : null
            }
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "12px",
                padding: "4px",
                borderColor: "#90caf9",
                boxShadow: "none",
              }),
            }}
          />
        </div>

        {/* OR text */}
        <span className="col-md-6 text-muted d-flex justify-content-center align-items-center text-white">
          — or add new —
        </span>

        {/* Manual Name Input */}
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
              setCustomerInfo((prev) => ({
                ...prev,
                name: e.target.value,
              }));
            }}
            className="form-control rounded-3"
            placeholder="✍️ Enter new customer name"
          />
        </div>

        {/* GSTIN */}
        <div className="col-md-6">
          <input
            type="text"
            name="gstin"
            value={customerInfo?.gstin || ""}
            onChange={onChange}
            className="form-control rounded-3"
            placeholder="🏷 GSTIN (optional)"
          />
        </div>

        {/* Billing Address */}
        <div className="col-12">
          <input
            type="text"
            name="billingAddress"
            value={customerInfo?.billingAddress || ""}
            onChange={onChange}
            className="form-control rounded-3"
            placeholder="📍 Billing Address (optional)"
          />
        </div>

        {/* Shipping Address */}
        <div className="col-12">
          <input
            type="text"
            name="shippingAddress"
            value={customerInfo?.shippingAddress || ""}
            onChange={onChange}
            className="form-control rounded-3"
            placeholder="🚚 Shipping Address (optional)"
          />
        </div>

        {/* Contact Phone */}
        <div className="col-md-6">
          <input
            type="tel"
            name="contactPhone"
            value={customerInfo?.contactPhone || ""}
            onChange={onChange}
            className="form-control rounded-3"
            placeholder="📞 Contact Phone"
            required
          />
        </div>
      </div>
    </motion.div>
  );
}
