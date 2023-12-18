const express = require("express");
const cors = require("cors");
const { config } = require("dotenv");
const authRoutes = require("./src/routes/authRoutes");
const { connect } = require("./src/helper/dbConnect");
// const clientRoutes = require('./src/routes/clientRoutes');
// const authenticatedRoute = require('./src/middleware/authMiddleware');

config();
connect();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/auth", authRoutes);
// app.use('/client', authenticatedRoute, clientRoutes);

module.exports = app;
