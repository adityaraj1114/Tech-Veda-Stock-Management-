// src/components/Login.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, Lightbulb, Package } from "lucide-react"; // Install lucide-react

// Floating Icon Component
const FloatingIcon = ({ Icon, size, color, style, duration, delay, xRange, yRange }) => {
  return (
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
};

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
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center p-3"
      style={{
        background: "linear-gradient(135deg, #2d87aeff, #197998ff, #28424dff)",
        position: "relative", 
        overflow: "hidden", 
      }}
    >
      {/* Floating Tech Icons */}
      <FloatingIcon
        Icon={Cpu}
        size={50}
        color="rgba(255,255,255,0.2)"
        style={{ top: "10%", left: "15%" }}
        duration={20}
        delay={0}
        xRange={[0, 120]}
        yRange={[0, 80]}
      />
      <FloatingIcon
        Icon={Lightbulb}
        size={40}
        color="rgba(255,255,255,0.15)"
        style={{ top: "50%", left: "80%" }}
        duration={25}
        delay={2}
        xRange={[0, -100]}
        yRange={[0, -60]}
      />
      <FloatingIcon
        Icon={Package}
        size={60}
        color="rgba(255,255,255,0.1)"
        style={{ top: "70%", left: "20%" }}
        duration={30}
        delay={1}
        xRange={[0, 150]}
        yRange={[0, -100]}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="col-md-4"
        style={{ zIndex: 1 }}
      >
        <div
          className="card p-5 rounded-4 shadow-lg"
          style={{
            backdropFilter: "blur(2px)",
            backgroundColor: "rgba(22, 22, 24, 0.55)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2 className="text-center mb-4 text-white">🔐 Login</h2>

          {error && (
            <motion.div
              className="alert alert-danger text-center py-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <motion.div
              className="mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <label className="form-label fw-semibold text-white">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </motion.div>

            <motion.div
              className="mb-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <label className="form-label fw-semibold text-white">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </motion.div>

            <motion.button
              type="submit"
              className="btn w-100 mb-3"
              style={{
                background: "linear-gradient(90deg, #FF69B4, #1E90FF)",
                color: "#fff",
                fontWeight: "600",
              }}
              whileHover={{ scale: 1.05, boxShadow: "0px 6px 25px rgba(0,0,0,0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </form>

          <div className="text-center mt-3 text-white">
            {!userExists ? (
              <small>
                First time setup? <Link to="/signup" className="text-warning">Create account</Link>
              </small>
            ) : (
              <small className="d-block">
                Only registered users can login. <br />
                If you're not authorized, please contact the seller.
              </small>
            )}
          </div>

          <motion.div className="text-center mt-4" whileHover={{ scale: 1.03 }}>
            <button
              className="btn w-100"
              style={{
                border: "2px solid #28a745",
                color: "#28a745",
                background: "transparent",
              }}
              onClick={contactSeller}
            >
              📲 Contact Seller
            </button>
          </motion.div>
        </div>

        <div className="text-center mt-3 text-white">
          <small>Powered by <b>Tech Veda's</b></small>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
