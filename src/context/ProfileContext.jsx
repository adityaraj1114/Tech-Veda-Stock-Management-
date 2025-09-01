// src/context/ProfileContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ProfileContext = createContext({
  profile: {},
  updateProfile: () => {},
});

const safeParse = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : {};
    return typeof data === "object" && data !== null ? data : {};
  } catch {
    return {};
  }
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => safeParse("profile"));

  // Persist on every change
  useEffect(() => {
    localStorage.setItem("profile", JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (newData) => {
    setProfile(newData);
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

// Custom hook
export const useProfile = () => useContext(ProfileContext);
