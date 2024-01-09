const { createResponse } = require("../helper/utils");
const { userRegularModel } = require("../model/user");

const addToCart = async (req, res) => {
  console.log("request", req.user.user_id);
  try {
    const cartItems = req.body.cartItems;

    // Check if cartItems is present in the request body
    if (cartItems && Array.isArray(cartItems)) {
      // Find the user
      const user = await userRegularModel.findById(req.user.user_id);

      if (!user) {
        return createResponse(res, 404, "User not found", null);
      }

      // Update the user's cart
      for (const item of cartItems) {
        const { name, quantity, unitPrice, total, purchased } = item;

        if (name && quantity && unitPrice) {
          await user.updateCartDetails({
            name,
            quantity,
            unitPrice,
            purchased,
            total,
          });
        } else {
          return createResponse(
            res,
            400,
            "Incomplete data: Each item should have name, quantity, and unitPrice",
            null
          );
        }
      }

      return createResponse(res, 200, "Cart details added successfully", user);
    } else {
      return createResponse(
        res,
        400,
        "Incomplete data: Please provide an array of cart items",
        null
      );
    }
  } catch (error) {
    console.error("Error adding cart details:", error);
    return createResponse(res, 500, "Internal server error", null);
  }
};

const getCart = async (req, res) => {
  try {
    // Find the user
    const user = await userRegularModel.findById(req.user.user_id);

    if (!user) {
      return createResponse(res, 404, "User not found", null);
    }

    // Return the user's cart
    return createResponse(
      res,
      200,
      "Cart details fetched successfully",
      user.cart
    );
  } catch (error) {
    console.error("Error fetching cart details:", error);
    return createResponse(res, 500, "Internal server error", null);
  }
};

module.exports = { addToCart, getCart };
