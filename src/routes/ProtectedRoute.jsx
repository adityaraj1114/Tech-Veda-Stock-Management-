import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // agar token nahi mila to login page pe redirect kar do
    return <Navigate to="/login" replace />;
  }

  return children; // agar token hai to component allow karo
};

export default ProtectedRoute;
