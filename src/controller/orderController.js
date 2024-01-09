const multipleKnapsack = require("../helper/knapsack");
const { knapsack } = require("../helper/knapsack");
const { Order } = require("../model/order");
const { userRegularModel, userBuyerModel } = require("../model/user");

// const reciveOrder = async (req, res) => {
//   function generateUniqueOrderNumber() {
//     const timestamp = Date.now().toString(36); // Convert current timestamp to base36
//     const randomPart = Math.random().toString(36).substr(2, 5); // Random 5-character string

//     return `${timestamp}-${randomPart}`;
//   }

//   const userId = req.params.id;

//   try {
//     // Find the regular user by ID
//     const regularUser = await userRegularModel.findById(userId);

//     if (!regularUser) {
//       return res.status(404).json({
//         status: 404,
//         message: "Regular user not found",
//       });
//     }

//     // Create a cartItems array based on the user data
//     const cartItems = regularUser.cart
//       .filter((item) => item.purchased)
//       .map((item) => ({
//         name: item.name,
//         quantity: item.quantity,
//         unitPrice: item.unitPrice,
//         _id: item._id,
//       }));

//     // Exclude sensitive fields from the user details
//     const modifiedUser = {
//       _id: regularUser._id,
//       email: regularUser.email,
//       role: regularUser.role,
//       firstName: regularUser.firstName,
//       lastName: regularUser.lastName,
//       contact: regularUser.contact,
//       location: regularUser.location,
//       // Add other fields you want to include
//     };

//     // Generate a unique order number
//     const orderNumber = generateUniqueOrderNumber();

//     // Create a new order document with the order number
//     const newOrder = new Order({
//       user: userId,
//       orderNumber,
//       cartItems,
//     });

//     // Save the order to the database
//     const savedOrder = await newOrder.save();

//     // Include modified user details in the response
//     const responseOrder = {
//       ...savedOrder.toObject(),
//       user: modifiedUser,
//     };

//     if (responseOrder.cartItems) {
//       //retrive items from orders
//       const itemQuantities = responseOrder.cartItems.map(
//         (item) => item.quantity
//       );
//       const unitPrice = responseOrder.cartItems.map((item) =>
//         Number(item.unitPrice)
//       );

//       // Retrieve the buyer's vehicles
//       const allVehicles = await userBuyerModel.find({}, "vehicles");
//       const vehicles = allVehicles.flatMap((buyer) => buyer.vehicles);

//       const vehiclesCapacity = vehicles.map(
//         (vehicle) => vehicle.maximumCapacity
//       );

//       const selectedItems = knapsack(
//         unitPrice,
//         itemQuantities,
//         vehiclesCapacity
//       );

//       // Find the first vehicle that can accommodate the items
//       let selectedVehicle = null;
//       for (let i = 0; i < vehiclesCapacity.length; i++) {
//         if (selectedItems[i] > 0) {
//           selectedVehicle = vehiclesCapacity[i];
//           break;
//         }
//       }

//       const matchingBuyers = await userBuyerModel.find({
//         "vehicles.maximumCapacity": selectedVehicle,
//       });

//       // Log the details of matching buyers
//       if (matchingBuyers.length > 0) {
//         console.log("Matching Buyers Found:");
//         matchingBuyers.forEach((buyer) => {
//           console.log("Buyer Details:", buyer);
//         });
//       } else {
//         console.log("No Matching Buyers Found");
//       }
//     }

//     // Send a success response with the updated order details
//     return res.status(201).json({
//       status: 201,
//       message: "Order created successfully",
//       order: responseOrder,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);

//     // Send an error response
//     return res.status(500).json({
//       status: 500,
//       message: "Error creating order",
//       error: error.message,
//     });
//   }
// };

// const createOrder = async (req, res) => {
//   const userId = req.params.id;
//   try {
//     // Find the regular user by ID
//     const regularUser = await Order.findById(userId);

//     if (!regularUser) {
//       throw new Error("Regular user not found");
//     }

//     // Filter only purchased items
//     const purchasedItems = regularUser.cart.filter((item) => item.purchased);

//     if (purchasedItems && purchasedItems.length > 0) {
//       // Retrieve the buyer's vehicles
//       const allVehicles = await userBuyerModel.find({}, "vehicles");
//       const vehicles = allVehicles.flatMap((buyer) => buyer.vehicles);

//       // Use the knapsack algorithm to select items that fit the vehicles' capacities
//       const itemQuantities = purchasedItems.map((item) => item.quantity);
//       const unitPrice = purchasedItems.map((item) => Number(item.unitPrice));

//       const vehiclesCapacity = vehicles.map(
//         (vehicle) => vehicle.maximumCapacity
//       );

//       const selectedItems = knapsack(
//         unitPrice,
//         itemQuantities,
//         vehiclesCapacity
//       );

//       // Find the first vehicle that can accommodate the items
//       let selectedVehicle = null;
//       for (let i = 0; i < vehiclesCapacity.length; i++) {
//         if (selectedItems[i] > 0) {
//           selectedVehicle = vehiclesCapacity[i];
//           break;
//         }
//       }

//       const matchingBuyers = await userBuyerModel.find({
//         "vehicles.maximumCapacity": selectedVehicle,
//       });
//       // Log the details of matching buyers
//       if (matchingBuyers.length > 0) {
//         console.log("Matching Buyers Found:");
//         matchingBuyers.forEach((buyer) => {
//           console.log("Buyer Details:", buyer);
//         });
//       } else {
//         console.log("No Matching Buyers Found");
//       }

//       // Create cartItems based on selectedItems
//       const cartItems = selectedItems.items.map((item) => ({
//         name: item.model, // Assuming you want to use the model as the name
//         quantity: item.quantity,
//         unitPrice: item.unitPrice,
//         purchased: item.purchased,
//       }));

//       // Create a new order
//       const order = new Order({
//         orderNumber: generateOrderNumber(), // Assuming you have a generateOrderNumber function
//         user: regularUser._id,
//         cartItems,
//       });

//       // Save the order
//       await order.save();

//       // Mark the purchased items as purchased in the user's cart
//       regularUser.cart.forEach((item) => {
//         if (item && (item.purchased === true || item.purchased === false)) {
//           item.purchased = true;
//         }
//       });

//       // Save the user
//       await regularUser.save();

//       // Send the order to eligible buyers (For simplicity, just console log here)
//       console.log("Sending order to eligible buyers.");
//     } else {
//       console.log("No purchased items to create an order.");
//     }

//     // Send a success response
//     return res.status(200).json({
//       status: 200,
//       message: "Cart details added successfully",
//       data: regularUser, // You may want to send the updated user data in the response
//     });
//   } catch (error) {
//     console.error("Error creating order:", error.message);
//     // Send an error response
//     return res.status(500).json({
//       status: 500,
//       message: "Error creating order",
//       error: error.message,
//     });
//   }
// };

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
      return res.status(404).json({ error: "Regular user not found" });
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

    const cartItems = purchasedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    // Create an order in the OrderModel
    const newOrder = new Order({
      orderNumber: generateUniqueOrderNumber(),
      userId: userId,
      buyerIds: buyerIds,
      orderDetails: cartItems,
      isComplete: false,
    });
    console.log("buyers order", newOrder);

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
    // Assuming you get the buyerIds from query parameters
    const buyersIds = req.params.id;
    console.log("buyersid", buyersIds);

    const { isComplete } = req.body;
    console.log("isComplete", isComplete);

    // Fetch orders for the specified buyerIds
    const orders = await Order.find({ buyerIds: { $in: buyersIds } });

    // Extract userId and isComplete from each order
    const ordersWithUserIdAndIsComplete = orders.map(
      ({ userId, isComplete }) => ({ userId, isComplete })
    );

    // Fetch additional information for each user from userRegularModel
    const usersInformation = await Promise.all(
      ordersWithUserIdAndIsComplete.map(async ({ userId, isComplete }) => {
        const userInformation = await userRegularModel.findById(userId, {
          cart: 0,
          role: 0,
          password: 0,
          email: 0,
        });
        return { userId, isComplete, userInfo: userInformation };
      })
    );

    res.status(200).json({ orders: usersInformation });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { orderTracker, getOrdersForBuyers };
