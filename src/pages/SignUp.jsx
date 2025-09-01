// src/pages/Signup.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthContext } from "../context/AuthContext";   // <-- import context

export default function Signup() {
  const { setUser } = useContext(AuthContext);          // <-- grab setUser here
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1) persist user & token
    localStorage.setItem("user", JSON.stringify(formData));
    localStorage.setItem("token", "dummy_token_123");

    // 2) update AuthContext
    setUser(formData);

    // 3) feedback + redirect
    alert("Signup successful! Please login.");
    // toast.success("Signup successful! Please login.");
    navigate("/login");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Sign Up</h3>
              <form onSubmit={handleSubmit}>
                {/** --- Full Name --- */}
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

                {/** --- Shop Name --- */}
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

                {/** --- Email --- */}
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

                {/** --- Password --- */}
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

                <button type="submit" className="btn btn-primary w-100">
                  Sign Up
                </button>
              </form>

              <p className="mt-3 text-center">
                Already have an account? <a href="/login">Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
