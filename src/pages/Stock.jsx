import React, { useState } from "react";
import CurrentStock from "../components/CurrentStock";

const Stock = () => {

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📦 Stock Management</h2>

      

      {/* Current Stock from Context */}
      <CurrentStock />
    </div>
  );
};

export default Stock;
