// src/pages/Signup.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const { updateProfile } = useProfile();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
    code: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔒 Agar already user registered hai to login page par bhej do
  useEffect(() => {
    const userExists = !!localStorage.getItem("user");
    if (userExists) {
      navigate("/login");
    }
  }, [navigate]);

  // Input change handler
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const result = signup(
      formData.email,
      formData.password,
      formData.shopName,
      formData.code,
      formData.name
    );

    if (result.success) {
      updateProfile({
        shopName: formData.shopName,
        ownerName: formData.name,
        email: formData.email,
      });

      alert("Signup successful! Please login.");
      navigate("/login");
    } else {
      setError(result.message);
    }
  };

  // 📲 Contact Seller via WhatsApp
  const contactSeller = () => {
    const message = `Hello, I’m interested in buying your software. Please guide me.`;
    const phone = "9507935720";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="col-md-6">
        <div className="card shadow-lg p-4 rounded-4">
          <h3 className="text-center mb-4">📝 First-Time Setup</h3>

          {error && (
            <div className="alert alert-danger text-center py-2">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Shop Name</label>
              <input
                type="text"
                className="form-control"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Signup Code (provided by seller)
              </label>
              <input
                type="text"
                className="form-control"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Create Account
            </button>
          </form>

          {/* Contact Seller Button */}
          <div className="text-center mt-4">
            <button className="btn btn-outline-success w-100" onClick={contactSeller}>
              📲 Contact Seller
            </button>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="text-center mt-3">
          <small className="text-muted">Powered by <b>Tech Veda's</b></small>
        </div>
      </div>
    </div>
  );
}
