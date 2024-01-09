const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true },
  userId: { type: String, required: true },
  buyerIds: { type: [String], default: [] },
  orderDetails: [
    {
      _id: false,
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: String, required: true },
    },
  ],
  isComplete: { type: Boolean },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = { Order };
