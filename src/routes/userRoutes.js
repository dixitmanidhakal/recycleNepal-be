const express = require("express");
const { addToCart, getCart } = require("../controller/userController");

const router = express.Router();

router.post("/cart", addToCart);
router.get("/cart", getCart);

module.exports = router;
