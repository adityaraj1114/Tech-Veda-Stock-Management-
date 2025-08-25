const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/authController");

// Example route
router.get("/test", (req, res) => {
  res.send("Auth route working");
});

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

module.exports = router;
