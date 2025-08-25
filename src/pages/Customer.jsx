import React, { useState, useEffect } from "react";

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    totalAmount: "",
    paidAmount: ""
  });

  // Load customers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customers");
    if (saved) {
      setCustomers(JSON.parse(saved));
    }
  }, []);

  // Save customers to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add customer
  const handleSubmit = (e) => {
    e.preventDefault();
    const total = parseFloat(formData.totalAmount);
    const paid = parseFloat(formData.paidAmount);
    const pending = total - paid;

    const newCustomer = {
      id: Date.now(),
      name: formData.name,
      totalAmount: total,
      paidAmount: paid,
      pendingAmount: pending,
    };

    setCustomers([...customers, newCustomer]);
    setFormData({ name: "", totalAmount: "", paidAmount: "" });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Customer Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="name"
          placeholder="Customer Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="totalAmount"
          placeholder="Total Amount"
          value={formData.totalAmount}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="paidAmount"
          placeholder="Paid Amount"
          value={formData.paidAmount}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Customer</button>
      </form>

      {/* Customer Table */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Amount</th>
            <th>Paid Amount</th>
            <th>Pending Amount</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan="4" align="center">No customers found</td>
            </tr>
          ) : (
            customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>₹{c.totalAmount}</td>
                <td>₹{c.paidAmount}</td>
                <td>₹{c.pendingAmount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Customer;
