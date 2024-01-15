const express = require("express");
const {
  orderTracker,
  getOrdersForBuyers,
  orderCompletion,
} = require("../controller/orderController");

const router = express.Router();

router.post("/createOrder/:id", orderTracker);

router.get("/getOrderList/:id", getOrdersForBuyers);

router.post("/accpectedOrder/:id", orderCompletion);

module.exports = router;
