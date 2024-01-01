const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userRegularModel = require("./user").userRegularModel;

// userRegularModel.findById("some-id", function (err, user) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(user);
//   }
// });

const orderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: Schema.Types.ObjectId, ref: "Regular" },
  cartItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: String, required: true },
      purchased: { type: Boolean, default: false },
    },
  ],
});

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
