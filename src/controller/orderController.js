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
      { $set: { buyerIds: [buyerId], isComplete: false } }
    );

    // Fetch orders for the specified buyerId
    const orders = await Order.find({ buyerIds: { $in: [buyerId] } }).populate(
      "orderDetails"
    );

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
    const orders = await Order.find({ buyerIds: { $in: [buyerId] } }).populate(
      "orderDetails"
    );

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
module.exports = { orderTracker, getOrdersForBuyers, orderCompletion };
