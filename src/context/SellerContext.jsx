// import React, { createContext, useContext, useState, useEffect } from "react";

// // Helper to strip non-digits and default to “NA”
// const normalizePhone = (phone) =>
//   (phone || "").replace(/\D/g, "").trim() || "NA";

// const SellerContext = createContext();

// export function SellerProvider({ children }) {
//   const [sellers, setSellers] = useState(() => {
//     try {
//       const raw = localStorage.getItem("sellers");
//       const data = raw ? JSON.parse(raw) : [];
//       return Array.isArray(data) ? data : [];
//     } catch {
//       return [];
//     }
//   });

//   // Add or merge a seller and update running totals
//   const addSeller = (info) => {
//     setSellers((prev) => {
//       const phoneB = normalizePhone(info.contactPhone);
//       const existing = prev.find((s) => {
//         const sameName =
//           s.name?.trim().toLowerCase() === info.name?.trim().toLowerCase();
//         const phoneA = normalizePhone(s.contactPhone);
//         if (phoneA === "NA" || phoneB === "NA") {
//           return sameName;
//         }
//         return sameName && phoneA === phoneB;
//       });

//       if (existing) {
//         return prev.map((s) =>
//           s.id === existing.id
//             ? {
//                 ...s,
//                 // merge new fields if present
//                 contactPhone: info.contactPhone || s.contactPhone,
//                 billingAddress: info.billingAddress || s.billingAddress,
//                 shippingAddress: info.shippingAddress || s.shippingAddress,
//                 gstin: info.gstin || s.gstin,
//                 totalPurchase:
//                   (s.totalPurchase || 0) + (info.totalPurchase || 0),
//                 pendingAmount:
//                   (s.pendingAmount || 0) + (info.pendingAmount || 0),
//                 // paidAmount remains unchanged
//               }
//             : s
//         );
//       }

//       // brand-new seller
//       return [
//         ...prev,
//         {
//           id: Date.now() + Math.random(),
//           name: info.name.trim(),
//           contactPhone: info.contactPhone || "",
//           billingAddress: info.billingAddress || "",
//           shippingAddress: info.shippingAddress || "",
//           gstin: info.gstin || "",
//           totalPurchase: info.totalPurchase || 0,
//           paidAmount: info.paidAmount || 0,
//           pendingAmount: info.pendingAmount || 0,
//         },
//       ];
//     });
//   };

//   // Delete a seller by ID
//   const deleteSeller = (id) => {
//     if (window.confirm("Delete this seller?")) {
//       setSellers((prev) => prev.filter((s) => s.id !== id));
//     }
//   };

//   // Persist sellers to localStorage
//   useEffect(() => {
//     localStorage.setItem("sellers", JSON.stringify(sellers));
//   }, [sellers]);

//   return (
//     <SellerContext.Provider
//       value={{
//         sellers,
//         addSeller,
//         deleteSeller,
//       }}
//     >
//       {children}
//     </SellerContext.Provider>
//   );
// }

// export function useSeller() {
//   return useContext(SellerContext);
// }
