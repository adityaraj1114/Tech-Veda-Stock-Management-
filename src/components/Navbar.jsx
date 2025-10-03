import React, { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { Cpu, Lightbulb, Package } from "lucide-react";
import { motion } from "framer-motion";

// Floating animated icons (background props)
const FloatingIcon = ({ Icon, size, color, style, duration, delay, xRange, yRange }) => (
  <motion.div
    style={{
      position: "absolute",
      width: size,
      height: size,
      color,
      ...style,
      zIndex: 0,
    }}
    animate={{
      x: xRange,
      y: yRange,
      rotate: [0, 360],
    }}
    transition={{ duration, repeat: Infinity, repeatType: "mirror", delay, ease: "linear" }}
  >
    <Icon size={size} />
  </motion.div>
);

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { profile } = useProfile();
  const shopName = profile?.shopName || "My Shop";

  const [darkMode, setDarkMode] = useState(false);
  const collapseRef = useRef(null);
  const navigate = useNavigate();

  const closeNavbar = () => {
    const collapseEl = collapseRef.current;
    if (collapseEl && collapseEl.classList.contains("show")) {
      collapseEl.classList.remove("show");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-light");
  };

  const handleLogout = () => {
    closeNavbar();
    logout();
    navigate("/login");
  };

  const handleNavClick = (path, requiresAuth = false) => {
    closeNavbar();
    if (requiresAuth && !user) {
      alert("Please login first to access this page!");
      navigate("/login");
      return;
    }
    navigate(path);
  };

  const links = [
    { name: "Dashboard", path: "/dashboard", auth: true },
    { name: "Stock", path: "/stock", auth: true },
    { name: "Customer List", path: "/customerlist", auth: true },
    { name: "Buy", path: "/purchase", auth: true },
    { name: "Sale", path: "/sale", auth: true },
    { name: "Profile", path: "/profile", auth: true },
    { name: "Sign Up", path: "/signup", auth: false },
    { name: "Customer Catalog", path: "/customerCatalog", auth: false },
  ];

  return (
    <nav
      className="navbar navbar-expand-lg shadow-lg"
      style={{
        position: "relative",
        background: darkMode
          ? "linear-gradient(135deg, rgba(18, 18, 143, 0.95), rgba(162, 21, 132, 0.95))"
          : "linear-gradient(135deg, #2f2fedff, #b224f9ff, #f95ed7ff)",
        backdropFilter: "blur(2px)",
        zIndex: 10,
      }}
    >
      {/* Floating icons */}
      <FloatingIcon
        Icon={Cpu}
        size={25}
        color="rgba(255,255,255,0.08)"
        style={{ top: "-5%", left: "10%" }}
        duration={25}
        delay={0}
        xRange={[0, 20]}
        yRange={[0, 10]}
      />
      <FloatingIcon
        Icon={Lightbulb}
        size={20}
        color="rgba(255,255,255,0.06)"
        style={{ top: "30%", left: "80%" }}
        duration={30}
        delay={2}
        xRange={[0, -25]}
        yRange={[0, -15]}
      />
      <FloatingIcon
        Icon={Package}
        size={30}
        color="rgba(255,255,255,0.05)"
        style={{ top: "50%", left: "50%" }}
        duration={35}
        delay={1}
        xRange={[0, 30]}
        yRange={[0, -20]}
      />

      <div className="container-fluid">
        {/* Shop Name */}
        <span className="navbar-brand mb-0 h4 text-white fw-bold">
          <h1>🏪 {shopName}</h1>
        </span>

        {/* Hamburger */}
        <button
          className="navbar-toggler bg-light"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav" ref={collapseRef}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {links.map((link, idx) => (
              <li className="nav-item" key={idx}>
                <motion.span
                  className="nav-link text-white fw-semibold"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleNavClick(link.path, link.auth)}
                  whileHover={{ scale: 1.1, color: "#ff69b4" }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {link.name}
                </motion.span>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {/* Dark Mode */}
            <motion.button
              className={`btn btn-sm ${darkMode ? "btn-light" : "btn-dark"}`}
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.05 }}
            >
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </motion.button>

            {/* Login / Logout */}
            {user ? (
              <motion.button
                className="btn btn-danger btn-sm"
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
              >
                Logout
              </motion.button>
            ) : (
              <Link
                className="btn btn-success btn-sm"
                to="/login"
                onClick={closeNavbar}
              >
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
