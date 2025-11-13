// src/context/ProfileContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

// ----------------------------------------------------
// Exported named context so other modules can import { ProfileContext }
// ----------------------------------------------------
export const ProfileContext = createContext({
  profile: {
    shopName: "",
    ownerName: "",
    address: "",
    phone: "",
    gstNumber: "",
    gstPercent: 0, // always present
  },
  updateProfile: () => {},
});

// ----------------------------------------------------
// Helper: safely parse from localStorage
// ----------------------------------------------------
const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : {};

    if (typeof data !== "object" || data === null) {
      return {
        shopName: "",
        ownerName: "",
        address: "",
        phone: "",
        gstNumber: "",
        gstPercent: 0,
      };
    }

    return {
      shopName: data.shopName || "",
      ownerName: data.ownerName || "",
      address: data.address || "",
      phone: data.phone || "",
      gstNumber: data.gstNumber || "",
      gstPercent: parseFloat(data.gstPercent) || 0,
    };
  } catch {
    return {
      shopName: "",
      ownerName: "",
      address: "",
      phone: "",
      gstNumber: "",
      gstPercent: 0,
    };
  }
};

// ----------------------------------------------------
// Provider Component (named export)
 // ----------------------------------------------------
export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => safeParse("profile"));

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("profile", JSON.stringify(profile));
    } catch (err) {
      console.error("Error saving profile to localStorage:", err);
    }
  }, [profile]);

  // Update profile with automatic gst normalization
  const updateProfile = (newData) => {
    const updated = {
      ...profile,
      ...newData,
      gstPercent:
        newData.gstPercent !== undefined
          ? parseFloat(newData.gstPercent) || 0
          : profile.gstPercent,
    };
    setProfile(updated);
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

// ----------------------------------------------------
// Hook to consume profile context
// ----------------------------------------------------
export const useProfile = () => useContext(ProfileContext);
