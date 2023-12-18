const express = require("express");
const {
  register,
  login,
  deleteAdmin,
  forgotPassword,
  resetPassword,
} = require("../controller/authController");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
