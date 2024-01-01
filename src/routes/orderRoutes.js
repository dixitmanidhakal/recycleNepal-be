const express = require("express");
const { createOrder } = require("../controller/orderController");

const router = express.Router();

router.post("/createOrder/:id", createOrder);

module.exports = router;
