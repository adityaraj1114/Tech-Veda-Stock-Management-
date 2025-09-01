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
  });

  const [previewVisible, setPreviewVisible] = useState(false);
  const [editing, setEditing] = useState(false);

  // load existing
  useEffect(() => {
    if (profile.shopName) {
      setForm(profile);
      setPreviewVisible(true);
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
    reader.onload = () => setForm((f) => ({ ...f, logo: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(form);
    setPreviewVisible(true);
    setEditing(false);
  };

  const handleEdit = () => {
    setEditing(true);
    setPreviewVisible(true);
  };

  const handleShareCard = () => {
    const text =
      `🏪 ${form.shopName}\n` +
      `👤 ${form.ownerName}\n` +
      `📞 ${form.phone}\n` +
      `✉️ ${form.email}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="container mt-4">
      <ProfilePreview
        form={form}
        editing={editing}
        previewVisible={previewVisible}
        onEdit={handleEdit}
      />

      <VisitingCard
        form={form}
        previewVisible={previewVisible}
        onShare={handleShareCard}
      />

      <ProfileForm
        form={form}
        editing={editing}
        previewVisible={previewVisible}
        onChange={handleChange}
        onLogoUpload={handleLogoUpload}
        onSave={handleSave}
      />
    </div>
  );
}
