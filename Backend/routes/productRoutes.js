const express = require("express");
const router = express.Router();
const { addPurchaseEntry, getAllPurchases } = require("../controllers/productController");

// POST /api/products/purchase
router.post("/purchase", addPurchaseEntry);

// GET /api/products/purchases
router.get("/purchases", getAllPurchases);

module.exports = router;
