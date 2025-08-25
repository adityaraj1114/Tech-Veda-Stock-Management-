const express = require("express");
const router = express.Router();
const { addSale, getAllSales } = require("../controllers/saleController");

router.post("/add", addSale);
router.get("/all", getAllSales);

module.exports = router;
