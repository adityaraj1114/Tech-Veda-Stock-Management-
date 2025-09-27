// src/context/ProfileContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ProfileContext = createContext({
  profile: { gstPercent: 0 }, // ✅ always include gstPercent
  updateProfile: () => {},
});

// Safely parse from localStorage
const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : {};
    if (typeof data !== "object" || data === null) return { gstPercent: 0 };

    return {
      ...data,
      gstPercent: parseFloat(data.gstPercent) || 0, // ✅ normalize gstPercent
    };
  } catch {
    return { gstPercent: 0 };
  }
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => safeParse("profile"));

  // Persist profile in localStorage
  useEffect(() => {
    localStorage.setItem("profile", JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (newData) => {
    const updated = {
      ...profile, // ✅ preserve old fields
      ...newData,
      gstPercent: parseFloat(newData.gstPercent) || 0,
    };
    setProfile(updated);
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
