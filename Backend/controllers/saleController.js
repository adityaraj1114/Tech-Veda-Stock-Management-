const Sale = require("../models/Sale");
const Product = require("./models/Product");
const Purchase = require("../models/Purchase"); // Optional, for FIFO stock logic

exports.addSale = async (req, res) => {
  try {
    const { name, shopName, quantitySold, sellingPrice } = req.body;

    const product = await Product.findOne({ name });
    if (!product) return res.status(404).json({ msg: "Product not found" });

    if (product.totalStock < quantitySold) {
      return res.status(400).json({ msg: "Not enough stock available" });
    }

    // Hardcoded or simplified purchase price (latest known)
    // In production, you’d use FIFO logic
    const lastPurchase = await Purchase.findOne({ product: product._id })
      .sort({ date: -1 });

    const purchasePrice = lastPurchase ? lastPurchase.pricePerUnit : 0;

    const profitPerPiece = sellingPrice - purchasePrice;
    const totalProfit = profitPerPiece * quantitySold;
    const totalSale = sellingPrice * quantitySold;

    const sale = new Sale({
      product: product._id,
      shopName,
      quantitySold,
      sellingPrice,
      purchasePrice,
      profit: totalProfit,
      totalSale
    });

    await sale.save();

    // Decrease stock
    product.totalStock -= quantitySold;
    await product.save();

    res.status(201).json({ msg: "Sale recorded", sale });
  } catch (err) {
    res.status(500).json({ msg: "Error in sale", error: err.message });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate("product").sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching sales", error: err.message });
  }
};
