const express = require("express");
const { createOrder, reciveOrder } = require("../controller/orderController");

const router = express.Router();

router.post("/createOrder/:id", reciveOrder);

router.get("/getBuyerList", createOrder);

module.exports = router;
