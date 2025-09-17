// src/components/Login.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);

    if (result.success) {
      setError("");
      navigate("/dashboard");
    } else {
      setError(result.message || "Invalid credentials, please try again.");
    }
  };

  const userExists = !!localStorage.getItem("user");

  const contactSeller = () => {
    const message = `Hello, I’m interested in buying your software. Please guide me.`;
    const phone = "9507935720";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="col-md-4">
        <div className="card shadow p-4 rounded-4">
          <h2 className="text-center mb-4">🔐 Login</h2>

          {error && (
            <div className="alert alert-danger text-center py-2">{error}</div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>

          {/* Footer message */}
          <div className="text-center mt-3">
            {!userExists ? (
              <small className="text-muted">
                First time setup? <Link to="/signup">Create account</Link>
              </small>
            ) : (
              <small className="text-muted d-block">
                Only registered users can login. <br />
                If you're not authorized, please contact the seller.
              </small>
            )}
          </div>

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
};

export default Login;
