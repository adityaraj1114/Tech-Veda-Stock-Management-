// src/components/FooterNav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FaShoppingCart, FaCashRegister, FaUsers, FaBoxes } from "react-icons/fa";

export default function FooterNav() {
  return (
    <>
      <div className="footer-nav d-flex justify-content-around align-items-center pt-3">
        <NavLink to="/purchase" className="footer-link">
          <FaShoppingCart size={22} />
          <span>Buy</span>
        </NavLink>

        <NavLink to="/sale" className="footer-link">
          <FaCashRegister size={22} />
          <span>Sale</span>
        </NavLink>

        <NavLink to="/customerlist" className="footer-link">
          <FaUsers size={22} />
          <span>Customers</span>
        </NavLink>

        <NavLink to="/stock" className="footer-link">
          <FaBoxes size={22} />
          <span>Stock</span>
        </NavLink>
      </div>

      {/* Inline CSS */}
      <style>{`
        .footer-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(90deg, #4a00e0, #8e2de2);
          color: white;
          padding: 8px 0;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.2);
          z-index: 1000;
        }

        .footer-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
          color: white;
          text-decoration: none;
          transition: transform 0.2s ease, color 0.3s ease;
        }

        .footer-link.active {
          color: #ffeb3b;
          transform: scale(1.1);
        }

        .footer-link:hover {
          color: #ffe57f;
        }
      `}</style>
    </>
  );
}
