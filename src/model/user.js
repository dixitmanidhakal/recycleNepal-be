const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bcryptSalt = process.env.BCRYPT_SALT;

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

const userModel = mongoose.model("User", userSchema);

const buyerSchema = new mongoose.Schema({
  company: { type: String, required: true },
  location: { type: String, required: true },
  PAN: { type: String, required: true },
  vehicles: [
    {
      _id: false,
      model: { type: String, required: true },
      maximumCapacity: { type: Number, required: true },
    },
  ],
});

const userBuyerModel = userModel.discriminator("Itinerant Buyers", buyerSchema);

const regularUserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  contact: { type: String, required: true },
  location: { type: String, required: true },
  cart: {
    type: [
      {
        name: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
        purchased: { type: Boolean, default: false },
      },
    ],
  },
});

regularUserSchema.methods.updateCartDetails = async function (cartItem) {
  // Add the new item to the cart
  this.cart.push({ ...cartItem, purchased: cartItem.purchased || false }); // Set purchased to false initially

  // Save the user
  await this.save();

  return this;
};
const userRegularModel = userModel.discriminator("Regular", regularUserSchema);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
  this.password = hash;
  next();
});

module.exports = { userModel, userBuyerModel, userRegularModel };
