import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mount hone par session restore karega
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);

  // 🟢 Signup (naya user register karega)
  const signup = (email, password, shopName) => {
    const newUser = { email, password, shopName };
    localStorage.setItem("user", JSON.stringify(newUser)); // store registered user
    return { success: true, message: "Signup successful. Please login." };
  };

  // 🟢 Login (session create karega)
  const login = (email, password) => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      return { success: false, message: "Please sign up first." };
    }

    const parsed = JSON.parse(stored);
    if (parsed.email === email && parsed.password === password) {
      setUser(parsed);
      localStorage.setItem("loggedInUser", JSON.stringify(parsed)); // active session
      localStorage.setItem("token", "dummy_token_123");
      return { success: true };
    }

    return { success: false, message: "Invalid email or password" };
  };

  // 🟢 Logout (session clear karega)
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    setUser(null);
  };

  // 🟢 isAuthenticated flag
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook for easy use
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
};
