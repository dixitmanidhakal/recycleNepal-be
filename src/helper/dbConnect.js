require("dotenv").config();
const mongoose = require("mongoose");

const { CONNECTION_STRING } = process.env;

exports.connect = () => {
  if (!CONNECTION_STRING) {
    console.log(
      "CONNECTION_STRING is not defined in your environment varriable"
    );
    process.exit(1);
  }
  mongoose
    .connect(CONNECTION_STRING)
    .then(() => {
      console.log("DB connection ready...");
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};
