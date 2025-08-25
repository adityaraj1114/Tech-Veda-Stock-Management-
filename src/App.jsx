// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Purchase from "./pages/Purchase";
import Sale from "./pages/Sale";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import { InventoryProvider } from "./context/InventoryContext"; // ✅ Add this
import Customer from "./pages/Customer";

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        {/* ✅ Navbar ko AuthContext + InventoryContext dono se data milega */}
        <Navbar />

        <div className="container py-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            {/* <Route
              path="/customer"
              element={
                <PrivateRoute>
                  <Customer />
                </PrivateRoute>
              }
            /> */}
            <Route
              path="/sale"
              element={
                <PrivateRoute>
                  <Sale />
                </PrivateRoute>
              }
            />
            <Route
              path="/purchase"
              element={
                <PrivateRoute>
                  <Purchase />
                </PrivateRoute>
              }
            />

            {/* Default fallback */}
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;
