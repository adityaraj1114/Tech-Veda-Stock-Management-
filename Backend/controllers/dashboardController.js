const Product = require("./models/Product");
const Sale = require("../models/Sale");

exports.getDashboardSummary = async (req, res) => {
  try {
    const products = await Product.find();
    const sales = await Sale.find();

    const totalStock = products.reduce((sum, item) => sum + item.totalStock, 0);
    const totalProfit = sales.reduce((sum, item) => sum + item.profit, 0);
    const totalSalesAmount = sales.reduce((sum, item) => sum + item.totalSale, 0);

    // Today's date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = sales.filter((s) => new Date(s.date) >= today);

    const todayProfit = todaySales.reduce((sum, item) => sum + item.profit, 0);
    const todaySalesAmount = todaySales.reduce((sum, item) => sum + item.totalSale, 0);

    const lowStockProducts = products.filter(p => p.totalStock < 10000);

    res.json({
      totalStock,
      totalProfit,
      totalSalesAmount,
      todayProfit,
      todaySalesAmount,
      lowStockProducts
    });
  } catch (err) {
    res.status(500).json({ msg: "Dashboard error", error: err.message });
  }
};
