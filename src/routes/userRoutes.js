const express = require("express");
const {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
} = require("../controller/userController");

const router = express.Router();

router.post("/cart", addToCart);
router.get("/cart", getCart);
router.put("/cart/:userId/:cartId", updateCartItem);
router.delete("/cart/:userId/:cartId", deleteCartItem);

module.exports = router;
