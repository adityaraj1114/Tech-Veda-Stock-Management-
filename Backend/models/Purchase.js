const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  supplierName: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalAmount: { type: Number }, // calculated = quantity * pricePerUnit
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Purchase", purchaseSchema);
