const { createResponse } = require("../helper/utils");
const { userRegularModel } = require("../model/user");

const addToCart = async (req, res) => {
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
        const { name, quantity, unitPrice, total, purchased, volume } = item;

        if (name && quantity && unitPrice) {
          await user.updateCartDetails({
            name,
            quantity,
            unitPrice,
            purchased,
            total,
            volume,
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

    const unpurchasedItems = user.cart.filter((item) => !item.purchased);

    if (!user) {
      return createResponse(res, 404, "User not found", null);
    }

    // Return the user's cart
    return createResponse(
      res,
      200,
      "Cart details fetched successfully",
      unpurchasedItems
    );
  } catch (error) {
    console.error("Error fetching cart details:", error);
    return createResponse(res, 500, "Internal server error", null);
  }
};

const updateCartItem = async (req, res) => {
  try {
    const userId = req.params.userId;
    const itemId = req.params.cartId;
    console.log("req", req.params);

    // Find the regular user by ID
    const user = await userRegularModel.findById(userId);

    if (!user) {
      return createResponse(res, 404, "User not found", null);
    }

    // Find the cart item to update by ID
    const cartItem = user.cart.find((item) => item._id.toString() === itemId);
    console.log("Item ID:", cartItem);

    if (!cartItem) {
      return createResponse(res, 404, "Cart item not found", null);
    }

    // Update the purchased field
    cartItem.purchased = req.body.purchased;

    // Save the updated user
    await user.save();

    return createResponse(res, 200, "Cart item updated successfully", cartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    return createResponse(res, 500, "Internal server error", null);
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const userId = req.params.userId;
    const itemId = req.params.cartId;

    // Find the regular user by ID
    const user = await userRegularModel.findById(userId);

    // Check if the user is found
    if (!user) {
      return createResponse(res, 404, "User not found", null);
    }

    // Filter out the cart items where purchased is false and the item ID is not equal to itemId
    user.cart = user.cart.filter(
      (item) => !item.purchased && item._id.toString() !== itemId
    );

    // Save the updated user
    await user.save();

    return createResponse(res, 200, "Cart item deleted successfully", null);
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return createResponse(res, 500, "Internal server error", null);
  }
};
module.exports = { addToCart, getCart, updateCartItem, deleteCartItem };
