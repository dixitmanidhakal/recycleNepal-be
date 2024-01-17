const express = require("express");
const {
  orderTracker,
  getOrdersForBuyers,
  orderCompletion,
  userDetails,
  userOrderNotification,
} = require("../controller/orderController");

const router = express.Router();

router.post("/createOrder/:id", orderTracker);

router.get("/getOrderList/:id", getOrdersForBuyers);

router.post("/accpectedOrder/:id", orderCompletion);

router.get("/buyer/orderNotification/:id", userDetails);

router.get("/user/orderNotification/:id", userOrderNotification);

module.exports = router;
