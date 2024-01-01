const { knapsack } = require("../helper/knapsack");
const { Order } = require("../model/order");
const { userRegularModel, userBuyerModel } = require("../model/user");

const createOrder = async (req, res) => {
  const userId = req.params.id;
  try {
    // Find the regular user by ID
    const regularUser = await userRegularModel.findById(userId);

    if (!regularUser) {
      throw new Error("Regular user not found");
    }

    // Filter only purchased items
    const purchasedItems = regularUser.cart.filter((item) => item.purchased);
    console.log("purchased items", purchasedItems);

    if (purchasedItems.map((item) => item.purchased === true)) {
      const vehicles = await userBuyerModel.find({}, "vehicles");

      // Use the knapsack algorithm to select items that fit the vehicles' capacities
      const selectedItems = knapsack(purchasedItems, vehicles);

      // Create cartItems based on selectedItems
      const cartItems = selectedItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        purchased: item.purchased
      }));

      // Create a new order
      const order = new Order({
        orderNumber: generateOrderNumber(), // Assuming you have a generateOrderNumber function
        user: regularUser._id,
        cartItems,
      });

      // Save the order
      await order.save();

      // Mark the purchased items as purchased in the user's cart
      regularUser.cart.forEach((item) => {
        if (item && (item.purchased === true || item.purchased === false)) {
          item.purchased = true;
        }
      });

      // Save the user
      await regularUser.save();

      // Send the order to eligible buyers (For simplicity, just console log here)
      console.log("Sending order to eligible buyers.");
    } else {
      console.log("No purchased items to create an order.");
    }

    // Send a success response
    return res.status(200).json({
      status: 200,
      message: "Cart details added successfully",
      data: regularUser, // You may want to send the updated user data in the response
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    // Send an error response
    return res.status(500).json({
      status: 500,
      message: "Error creating order",
      error: error.message,
    });
  }
};

module.exports = { createOrder };
