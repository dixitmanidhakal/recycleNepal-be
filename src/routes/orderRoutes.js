const express = require("express");
const {
  orderTracker,
  getOrdersForBuyers,
  orderCompletion,
} = require("../controller/orderController");

const router = express.Router();

router.post("/createOrder/:id", orderTracker);

router.post("/getOrderList/:id", getOrdersForBuyers);

// router.post("/accpectedOrder", orderCompletion);

module.exports = router;
