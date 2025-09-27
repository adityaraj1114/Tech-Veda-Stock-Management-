// src/pages/Signup.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { motion } from "framer-motion";
import { Cpu, Lightbulb, Package } from "lucide-react"; // Install lucide-react

const FloatingIcon = ({ Icon, size, color, style, duration, delay, xRange, yRange }) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: size,
        height: size,
        color,
        ...style,
        zIndex: 0
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

  const contactSeller = () => {
    const message = `Hello, I’m interested in buying your software. Please guide me.`;
    const phone = "9507935720";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className="min-vh-100 d-flex justify-content-center align-items-center pt-4 pb-5"
      style={{
        background: "linear-gradient(135deg, #2d87aeff, #197998ff, #28424dff)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating tech icons */}
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

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="col-md-6"
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
          <h3 className="text-center mb-4 text-white">📝 First-Time Setup</h3>

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

          <form onSubmit={handleSubmit}>
            {[
              { label: "Full Name", name: "name", type: "text" },
              { label: "Shop Name", name: "shopName", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Password", name: "password", type: "password" },
              { label: "Signup Code (provided by seller)", name: "code", type: "text" },
            ].map((field, idx) => (
              <motion.div
                className="mb-3"
                key={field.name}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <label className="form-label text-white">{field.label}</label>
                <input
                  type={field.type}
                  className="form-control"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required
                />
              </motion.div>
            ))}

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
              Create Account
            </motion.button>
          </form>

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

        <div className="text-center mt-3 mb-5 text-white">
          <small>Powered by <b>Tech Veda's</b></small>
        </div>
      </motion.div>
    </div>
  );
}
