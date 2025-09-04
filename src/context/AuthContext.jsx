import React, { createContext, useState, useEffect, useContext } from "react";
import { validSignupCodes } from "../config/validSignupCodes"; // ✅ External list of codes

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Restore session on mount
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);

  // 🟢 Signup (requires valid code + only once)
  const signup = (email, password, shopName, code) => {
    if (!validSignupCodes.includes(code)) {
      return {
        success: false,
        message: "❌ Invalid signup code. Please contact the seller.",
      };
    }

    const existing = localStorage.getItem("user");
    if (existing) {
      return {
        success: false,
        message: "User already exists. Please login.",
      };
    }

    const newUser = { email, password, shopName };
    localStorage.setItem("user", JSON.stringify(newUser));
    return { success: true, message: "Signup successful. Please login." };
  };

  // 🟢 Login
  const login = (email, password) => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      return {
        success: false,
        message: "Please sign up first.",
      };
    }

    const parsed = JSON.parse(stored);
    if (parsed.email === email && parsed.password === password) {
      setUser(parsed);
      localStorage.setItem("loggedInUser", JSON.stringify(parsed));
      localStorage.setItem("token", "dummy_token_123");
      return { success: true };
    }

    return {
      success: false,
      message: "Invalid email or password",
    };
  };

  // 🟢 Logout
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    setUser(null);
  };

  // 🟢 Update shop profile
  const updateShopProfile = (updatedData) => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const parsed = JSON.parse(stored);
    const updatedUser = { ...parsed, ...updatedData };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        loading,
        signup,
        login,
        logout,
        updateShopProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
};
