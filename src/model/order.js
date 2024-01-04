const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "Regular" },
  orderNumber: { type: String, required: true, unique: true },
  cartItems: [
    {
      _id: false,
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: String, required: true },
    },
  ],
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = { Order };
