const nodemailer = require("nodemailer");

const emailHelper = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "example@gmail.com",
    pass: "123456789",
  },
});

module.exports = { emailHelper };
