const express = require("express");
const {
  createOrder,
  reciveOrder,
  orderTracker,
} = require("../controller/orderController");

const router = express.Router();

router.post("/createOrder/:id", orderTracker);

router.get("/getBuyerList", createOrder);

module.exports = router;
