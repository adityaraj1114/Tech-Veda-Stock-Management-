// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Signup from "./pages/SignUp";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Stock from "./pages/Stock";
import Purchase from "./pages/Purchase";
import Sale from "./pages/Sale";
import Profile from "./pages/Profile";
import CustomerList from "./pages/CustomerList";
import FooterNav from "./components/FooterNav";
// import SellerList from "./pages/SellerList";
import CustomerDetails from "./pages/CustomerDetails";
import ProfitLossReport from "./pages/ProfitLossReport";

import PrivateRoute from "./routes/PrivateRoute";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { CustomerProvider } from "./context/CustomerContext";
import { SalesProvider, useSales } from "./context/SalesContext";
import { PurchaseProvider, usePurchase } from "./context/PurchaseContext";
import { InventoryProvider } from "./context/InventoryContext";

// ✅ Wrapper to pass sales & purchases into InventoryProvider
function AppProviders({ children }) {
  const { sales } = useSales();
  const { purchases } = usePurchase();

  return (
    <InventoryProvider sales={sales} purchases={purchases}>
      {children}
    </InventoryProvider>
  );
}

function AppRoutes() {
  const location = useLocation(); // 👈 Track current route

  return (
    <Routes location={location} key={location.pathname}>
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

      <Route path="/profit-loss" element={<ProfitLossReport />} />

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

      {/* <Route
        path="/sellerlist"
        element={
          <PrivateRoute>
            <SellerList />
          </PrivateRoute>
        }
      /> */}

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

      {/* Fallback → redirect to Login */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <CustomerProvider>
          <SalesProvider>
            <PurchaseProvider>
              <AppProviders>
                <Navbar />
                <div className="container p-0" style={{ paddingBottom: "80px" }}>
                  {/* paddingBottom to avoid content hidden behind FooterNav */}
                  <AppRoutes />
                </div>
                <FooterNav />
              </AppProviders>
            </PurchaseProvider>
          </SalesProvider>
        </CustomerProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;
