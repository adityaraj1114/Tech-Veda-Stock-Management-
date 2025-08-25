const Product = require("./models/Product");
const Purchase = require("../models/Purchase");

exports.addPurchaseEntry = async (req, res) => {
  try {
    const { name, category, quantity, pricePerUnit, supplierName } = req.body;

    let product = await Product.findOne({ name });
    if (!product) {
      // If product not exists, create it
      product = new Product({ name, category, totalStock: 0 });
    }

    product.totalStock += quantity;
    await product.save();

    const totalAmount = quantity * pricePerUnit;

    const purchase = new Purchase({
      product: product._id,
      supplierName,
      quantity,
      pricePerUnit,
      totalAmount,
    });

    await purchase.save();

    res.status(201).json({ msg: "Purchase entry added", product, purchase });
  } catch (err) {
    res.status(500).json({ msg: "Error in adding purchase", error: err.message });
  }
};

// Optional: Get all purchases
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate("product").sort({ date: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ msg: "Error in fetching", error: err.message });
  }
};
