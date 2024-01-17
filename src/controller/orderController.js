const multipleKnapsack = require("../helper/knapsack");
const { knapsack } = require("../helper/knapsack");
const { Order } = require("../model/order");
const { userRegularModel, userBuyerModel } = require("../model/user");

const orderTracker = async (req, res) => {
  const userId = req.params.id;
  function generateUniqueOrderNumber() {
    const timestamp = Date.now().toString(36); // Convert current timestamp to base36
    const randomPart = Math.random().toString(36).substr(2, 5); // Random 5-character string

    return `${timestamp}-${randomPart}`;
  }

  try {
    // Find the regular user by ID
    const regularUser = await userRegularModel.findById(userId);

    if (!regularUser) {
      console.error("Regular user not found");
      return res.status(404).json({ error: "Regular User not found" });
    }

    const purchasedItems = regularUser.cart.filter((item) => item.purchased);

    if (!purchasedItems || purchasedItems.length === 0) {
      console.log("Items not found");
      return res.status(404).json({ error: "Items not found" });
    }

    const itemQuantities = purchasedItems.map((item) => item.quantity);
    const unitPrice = purchasedItems.map((item) => Number(item.unitPrice));

    const allVehicles = await userBuyerModel.find({}, "vehicles");
    const maximumCapacityArrays = allVehicles.map((entry) =>
      entry.vehicles.map((vehicle) => vehicle.maximumCapacity)
    );

    //use multiple knapsack to find the maximum capacity of vehicles
    const maxProfits = maximumCapacityArrays.map((capacities) => {
      return multipleKnapsack(itemQuantities, unitPrice, capacities);
    });

    //find nearest capacity
    const nearestCapacities = maxProfits.map((buyerProfit, buyerIndex) => {
      if (buyerProfit > 0) {
        const buyerCapacities = maximumCapacityArrays[buyerIndex];
        const maxProfitIndex = maxProfits.indexOf(Math.max(...maxProfits));
        if (buyerIndex === maxProfitIndex) {
          return buyerCapacities;
        }
      }
      return null;
    });

    const filteredCapacity = nearestCapacities.filter(Boolean);

    //fetch each buyers details with the nearest capacity
    const usersWithMatchingCapacities = await userBuyerModel.find({
      vehicles: {
        $all: filteredCapacity.map((capacity) => ({
          $elemMatch: {
            maximumCapacity: capacity,
          },
        })),
      },
    });

    if (
      !usersWithMatchingCapacities ||
      usersWithMatchingCapacities.length === 0
    ) {
      console.log("No matching buyers found");
      return res.status(404).json({ error: "No matching buyers found" });
    }

    const buyerIds = usersWithMatchingCapacities.map((buyer) => buyer._id);

    const determineVolumeCategory = (item) => {
      if (item.volume === "low") {
        return "low";
      } else if (item.volume === "medium") {
        return "medium";
      } else {
        return "high";
      }
    };

    const cartItems = purchasedItems.map((item) => ({
      volume: determineVolumeCategory(item),
      details: {
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      },
    }));

    // Create an order in the OrderModel
    const newOrder = new Order({
      orderNumber: generateUniqueOrderNumber(),
      userId: userId,
      buyerIds: buyerIds,
      orderDetails: cartItems,
      isComplete: false,
    });
    try {
      // Save the order to the database
      const savedOrder = await newOrder.save();
      console.log("Saved order", savedOrder);
      return res.status(200).json({ message: "Order sent successfully" });
    } catch (error) {
      console.error("Error saving order:", error);
      console.log("The error is", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.error("Error:", error);
    console.log("The error is", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const getOrdersForBuyers = async (req, res) => {
  try {
    // Assuming you get the buyerId from query parameters
    const buyerId = req.params.id;

    // If isComplete is true, replace the buyersIds array with an array that contains only buyerId
    // and set isComplete to true in the database

    await Order.updateMany(
      { buyerIds: { $in: [buyerId] } },
      { $set: { buyerIds: [buyerId] } }
    );

    // Fetch orders for the specified buyerId
    const orders = await Order.find({
      buyerIds: { $in: [buyerId] },
      isComplete: false,
    }).populate("orderDetails");

    // Extract userId and isComplete from each order
    const ordersWithUserIdAndIsComplete = orders.map(
      ({ userId, orderDetails, isComplete }) => ({
        userId,
        orderDetails,
        isComplete,
      })
    );

    // Fetch additional information for each user from userRegularModel
    const usersInformation = await Promise.all(
      ordersWithUserIdAndIsComplete.map(
        async ({ userId, isComplete, orderDetails }) => {
          const userInformation = await userRegularModel.findById(userId, {
            cart: 0,
            role: 0,
            password: 0,
            email: 0,
          });
          return { orderDetails, isComplete, userInfo: userInformation };
        }
      )
    );

    res.status(200).json({ orders: usersInformation });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const orderCompletion = async (req, res) => {
  try {
    // Assuming you get the buyerId from query parameters
    const buyerId = req.params.id;

    const { isComplete } = req.body;

    // If isComplete is true, replace the buyersIds array with an array that contains only buyerId
    // and set isComplete to true in the database
    if (isComplete) {
      await Order.updateMany(
        { buyerIds: { $in: [buyerId] } },
        { $set: { buyerIds: [buyerId], isComplete: true } }
      );
    }

    // Fetch orders for the specified buyerId
    const orders = await Order.find({
      $and: [{ buyerIds: { $in: [buyerId] } }, { isComplete: true }],
    }).populate("orderDetails");

    // Extract userId and isComplete from each order
    const ordersWithUserIdAndIsComplete = orders.map(
      ({ userId, orderDetails, isComplete }) => ({
        userId,
        isComplete,
        orderDetails,
      })
    );

    // Fetch additional information for each user from userRegularModel
    const usersInformation = await Promise.all(
      ordersWithUserIdAndIsComplete.map(
        async ({ userId, isComplete, orderDetails }) => {
          const userInformation = await userRegularModel.findById(userId, {
            cart: 0,
            role: 0,
            password: 0,
            email: 0,
          });
          return { orderDetails, isComplete, userInfo: userInformation };
        }
      )
    );

    res.status(200).json({ orders: usersInformation });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const userDetails = async (req, res) => {
  const buyerId = req.params.id;

  try {
    // Fetch orders where buyerId matches and isComplete is true
    const orders = await Order.find({
      buyerIds: buyerId,
      isComplete: true,
    });

    // Check if no orders were found
    if (orders.length === 0) {
      return res
        .status(404)
        .json({ error: "No completed orders found for the specified buyerId" });
    }

    // Extract userIds from all orders
    const userIds = orders.map((order) => order.userId);

    // Fetch user details for all extracted userIds
    const userDetails = await userRegularModel.find(
      { _id: { $in: userIds } },
      {
        cart: 0, // Exclude the 'cart' field
        role: 0,
        password: 0,
        email: 0,
      }
    );

    // Check if no user details were found
    if (userDetails.length === 0) {
      return res
        .status(404)
        .json({ error: "User details not found for the specified userIds" });
    }

    // Combine user details with their respective orders
    const combinedData = userDetails.map((user) => {
      const userOrders = orders
        .filter((order) => order.userId.toString() === user._id.toString())
        .flatMap((order) => order.orderDetails);
      return { userDetails: user, orders: userOrders };
    });

    // Send the combined response
    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching user details:", error);

    // Check for specific error types (e.g., Mongoose validation error)
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation error. Please check your request data." });
    }

    // Handle other types of errors with a generic response
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const userOrderNotification = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch orders where userId matches and isComplete is true
    const orders = await Order.find({
      userId,
      isComplete: true,
    });

    // Array to store orders with buyer details
    const ordersWithBuyerDetails = [];

    // Fetch buyer details for each order
    for (const order of orders) {
      // Fetch buyer details for each buyerId
      const buyerDetails = await userBuyerModel.find({
        _id: { $in: order.buyerIds },
      });

      // Add buyer details to the order
      const orderWithBuyerDetails = {
        ...order.toObject(),
        buyerDetails: buyerDetails,
      };

      // Add the modified order to the array
      ordersWithBuyerDetails.push(orderWithBuyerDetails);
    }

    // Send the orders with buyer details as a response
    res.status(200).json({ orders: ordersWithBuyerDetails });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  orderTracker,
  getOrdersForBuyers,
  orderCompletion,
  userDetails,
  userOrderNotification,
};
