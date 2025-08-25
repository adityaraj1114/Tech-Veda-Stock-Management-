const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  shopName: { type: String, required: true },
  quantitySold: { type: Number, required: true },
  sellingPrice: { type: Number, required: true }, // per piece
  purchasePrice: { type: Number, required: true }, // per piece at time of purchase
  profit: { type: Number }, // calculated
  totalSale: { type: Number }, // quantitySold * sellingPrice
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sale", saleSchema);
