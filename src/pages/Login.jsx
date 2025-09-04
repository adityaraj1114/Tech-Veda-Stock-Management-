import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  const userExists = !!localStorage.getItem("user");

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="col-md-4">
        <div className="card shadow p-4 rounded-4">
          <h2 className="text-center mb-4">🔐 Login</h2>

          {error && (
            <div className="alert alert-danger text-center py-2">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>

          {/* 🔒 Conditional signup link */}
          {!userExists ? (
            <div className="text-center mt-3">
              <small className="text-muted">
                First time setup? <a href="/signup">Create account</a>
              </small>
            </div>
          ) : (
            <div className="text-center mt-3">
              <small className="text-muted">
                Only registered users can login. If you're not authorized, please contact the seller.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
