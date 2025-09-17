// src/components/Navbar.jsx
import React, { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { profile } = useProfile();
  const shopName = profile?.shopName || "My Shop";

  const [darkMode, setDarkMode] = useState(false);
  const collapseRef = useRef(null);
  const navigate = useNavigate();

  // Collapse close helper
  const closeNavbar = () => {
    const collapseEl = collapseRef.current;
    if (collapseEl && collapseEl.classList.contains("show")) {
      collapseEl.classList.remove("show");
    }
  };

  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-light");
  };

  // Logout handler
  const handleLogout = () => {
    closeNavbar();      // ✅ Collapse navbar
    logout();           // ✅ Clear auth
    navigate("/login"); // ✅ Redirect to login
  };

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        darkMode ? "navbar-dark bg-dark" : "navbar-light bg-light"
      } shadow`}
    >
      <div className="container-fluid">
        {/* Shop Name */}
        <span className="navbar-brand mb-0 h4">
          🏪 <b>{shopName}</b>
        </span>

        {/* Hamburger */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
          ref={collapseRef}
        >
          {/* Left Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard" onClick={closeNavbar}>
                <b>Dashboard</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/stock" onClick={closeNavbar}>
                <b>Stock</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/customerlist" onClick={closeNavbar}>
                <b>Customer List</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/purchase" onClick={closeNavbar}>
                <b>Buy</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sale" onClick={closeNavbar}>
                <b>Sale</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile" onClick={closeNavbar}>
                <b>Profile</b>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/signup" onClick={closeNavbar}>
                <b>Sign Up</b>
              </Link>
            </li>
          </ul>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-2">
            {/* Dark Mode */}
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={toggleDarkMode}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>

            {/* Login / Logout */}
            {user ? (
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                <b>Logout</b>
              </button>
            ) : (
              <Link
                className="btn btn-success btn-sm"
                to="/login"
                onClick={closeNavbar}
              >
                <b>Login</b>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
