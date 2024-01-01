const express = require("express");
const jwt = require("jsonwebtoken");

const authenticatedRoute = express.Router();

authenticatedRoute.use(async function (req, res, next) {
  try {
    let accessTokenFromClient = req.headers.authorization?.split(" ")[1];

    if (!accessTokenFromClient) {
      return res.status(401).send("Authorization Header is missing");
    }

    const tokenKey = process.env.TOKEN_KEY;

    jwt.verify(accessTokenFromClient, tokenKey, (err, payload) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = payload;
      next();
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Authorization Header is missing or Invalid" });
  }
});

module.exports = { authenticatedRoute };
