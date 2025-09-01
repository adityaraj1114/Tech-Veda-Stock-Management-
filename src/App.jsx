// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import Purchase from "./pages/Purchase";
import Sale from "./pages/Sale";
import Profile from "./pages/Profile";
import CustomerList from "./pages/CustomerList";
import CustomerDetails from "./pages/CustomerDetails";

import PrivateRoute from "./routes/PrivateRoute";

import { AuthProvider } from "./context/AuthContext";
import { InventoryProvider } from "./context/InventoryContext";
import { ProfileProvider } from "./context/ProfileContext";

function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <ProfileProvider>
          {/* Navbar now has access to Auth, Inventory & Profile contexts */}
          <Navbar />

          <div className="container py-4">
            <Routes>
              {/* Public */}
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />

              {/* Protected */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              <Route
                path="/stock"
                element={
                  <PrivateRoute>
                    <Stock />
                  </PrivateRoute>
                }
              />

              <Route
                path="/customerlist"
                element={
                  <PrivateRoute>
                    <CustomerList />
                  </PrivateRoute>
                }
              />

              <Route
                path="/customers/:id"
                element={
                  <PrivateRoute>
                    <CustomerDetails />
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

              <Route
                path="/sale"
                element={
                  <PrivateRoute>
                    <Sale />
                  </PrivateRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Login />} />
            </Routes>
          </div>
        </ProfileProvider>
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;
