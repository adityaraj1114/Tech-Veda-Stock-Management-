import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-light");
  };

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        darkMode ? "navbar-dark bg-dark" : "navbar-light bg-light"
      } shadow`}
    >
      <div className="container-fluid">
        {/* Shop Name */}
        <span className="navbar-brand mb-0 h1">
          {user ? user.shopName : "TECH VEDA's"}
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

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/customer">Customer</Link>
            </li> */}
            <li className="nav-item">
              <Link className="nav-link" to="/purchase">Purchase</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sale">Sale</Link>
            </li>
          </ul>

          {/* Right Side */}
          <div className="d-flex align-items-center">
            {/* Dark Mode */}
            <button
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={toggleDarkMode}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>

            {/* Login / Logout */}
            {user ? (
              <button className="btn btn-danger btn-sm" onClick={logout}>
                Logout
              </button>
            ) : (
              <Link className="btn btn-success btn-sm" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
