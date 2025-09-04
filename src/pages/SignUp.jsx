import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
    code: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔒 Redirect to login if user already exists
  useEffect(() => {
    const userExists = !!localStorage.getItem("user");
    if (userExists) {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = signup(
      formData.email,
      formData.password,
      formData.shopName,
      formData.code // ✅ pass the signup code
    );

    if (result.success) {
      alert("Signup successful! Please login.");
      navigate("/login");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
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
              <label className="form-label">Signup Code (provided by seller)</label>
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
        </div>
      </div>
    </div>
  );
}
