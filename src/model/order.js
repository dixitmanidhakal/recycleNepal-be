const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true },
  userId: { type: String, required: true },
  buyerIds: { type: [String], default: [] },
  orderDetails: [
    {
      volume: { type: String },
      details: {
        _id: false,
        name: { type: String },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    },
  ],
  isComplete: { type: Boolean },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = { Order };
