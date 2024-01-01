const express = require("express");
const cors = require("cors");
const { config } = require("dotenv");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const { authenticatedRoute } = require("./src/middleware/authMiddleware");
const { connect } = require("./src/helper/dbConnect");

config();
connect();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", authenticatedRoute, userRoutes);
app.use("/orders", authenticatedRoute, orderRoutes);

module.exports = app;
