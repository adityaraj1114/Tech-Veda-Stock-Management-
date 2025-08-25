const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    stockStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },
    supplier: {
      type: String, // supplier name/id
    },
    purchasePrice: {
      type: Number, // e.g. Rs 1.20
    },
    salePrice: {
      type: Number, // e.g. Rs 1.50
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
