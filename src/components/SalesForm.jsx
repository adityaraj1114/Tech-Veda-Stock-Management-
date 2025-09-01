// // src/components/SalesForm.jsx
// import React from "react";

// const SalesForm = ({
//   customer,
//   setCustomer,
//   product,
//   setProduct,
//   quantity,
//   setQuantity,
//   price,
//   setPrice,
//   uniqueProducts,
//   handleAddToCart,
// }) => {
//   const formatProduct = (prod) =>
//     prod
//       .split(" ")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(" ");

//   return (
//     <form onSubmit={handleAddToCart} className="row g-2 mb-4">
//       <div className="col-md">
//         <input
//           type="text"
//           className="form-control"
//           placeholder="Customer Name"
//           value={customer}
//           onChange={(e) => setCustomer(e.target.value)}
//         />
//       </div>
//       <div className="col-md">
//         <select
//           className="form-control"
//           value={product}
//           onChange={(e) => setProduct(e.target.value)}
//         >
//           <option value="">-- Select Product --</option>
//           {uniqueProducts.map((prod, i) => (
//             <option key={i} value={formatProduct(prod)}>
//               {formatProduct(prod)}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div className="col-md">
//         <input
//           type="number"
//           className="form-control"
//           placeholder="Quantity"
//           value={quantity}
//           onChange={(e) => setQuantity(e.target.value)}
//         />
//       </div>
//       <div className="col-md">
//         <input
//           type="number"
//           className="form-control"
//           placeholder="Price per Unit"
//           value={price}
//           onChange={(e) => setPrice(e.target.value)}
//         />
//       </div>
//       <div className="col-auto">
//         <button type="submit" className="btn btn-warning px-4">
//           ➕ Add to Cart
//         </button>
//       </div>
//     </form>
//   );
// };

// export default SalesForm;
