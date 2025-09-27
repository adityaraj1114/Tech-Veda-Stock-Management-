import React, { useState, useEffect } from "react";
import { useProfile } from "../context/ProfileContext";

import ProfilePreview from "../components/ProfilePreview";
import VisitingCard from "../components/VisitingCard";
import ProfileForm from "../components/ProfileForm";

export default function Profile() {
  const { profile, updateProfile } = useProfile();

  const [form, setForm] = useState({
    ownerName: "",
    shopName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    gstin: "",
    pan: "",
    logo: "",
    website: "",
  });

  const [previewVisible, setPreviewVisible] = useState(false);
  const [editing, setEditing] = useState(false);

  // Load profile from context on mount
  useEffect(() => {
    if (profile && profile.shopName) {
      setForm(profile);
      setPreviewVisible(true);
      setEditing(false);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({
        ...f,
        logo: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.shopName || !form.ownerName) {
      alert("Please enter both Shop Name and Owner Name.");
      return;
    }
    updateProfile(form);
    setPreviewVisible(true);
    setEditing(false);
  };

  const handleEdit = () => {
    setEditing(true);
    setPreviewVisible(false); // ✅ fix: ab form khulega, preview band hoga
  };

  const handleShareCard = () => {
    const textParts = [
      form.shopName ? `🏪 ${form.shopName}` : "",
      form.ownerName ? `👤 ${form.ownerName}` : "",
      form.addressLine1
        ? `📍 ${form.addressLine1}${form.addressLine2 ? ", " + form.addressLine2 : ""}${
            form.city ? ", " + form.city : ""
          }${form.state ? ", " + form.state : ""}${form.pincode ? " - " + form.pincode : ""}`
        : "",
      form.phone ? `📞 ${form.phone}` : "",
      form.email ? `✉️ ${form.email}` : "",
      form.gstin ? `GSTIN: ${form.gstin}` : "",
      form.pan ? `PAN: ${form.pan}` : "",
      form.website ? `🌐 ${form.website}` : "",
    ];

    const text = textParts.filter(Boolean).join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="container rounded mt-4 pb-5">
      {/* Agar preview visible aur editing OFF → preview + visiting card */}
      {previewVisible && !editing && (
        <>
          <ProfilePreview
            form={form}
            editing={editing}
            previewVisible={previewVisible}
            onEdit={handleEdit}
          />
          <VisitingCard form={form} onShare={handleShareCard} />
        </>
      )}

      {/* Agar editing mode ya profile pehli baar set ho rha hai → form */}
      {(editing || !previewVisible) && (
        <ProfileForm
          form={form}
          editing={editing}
          previewVisible={previewVisible}
          onChange={handleChange}
          onLogoUpload={handleLogoUpload}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
