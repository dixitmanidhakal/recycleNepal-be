const { createResponse } = require("../helper/utils");
const {
  userModel,
  userBuyerModel,
  userRegularModel,
} = require("../model/user");
const Token = require("../model/token");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const emailHelper = require("../config/emailHelper");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return createResponse(
        res,
        400,
        "Email and password must not be empty",
        null
      );
    }
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const tokenKey = process.env.TOKEN_KEY;

      if (!tokenKey) {
        return createResponse(
          res,
          500,
          "Internal Server Error: TOKEN_KEY not defined",
          null
        );
      }

      const token = jsonwebtoken.sign({ user_id: user._id, email }, tokenKey, {
        expiresIn: "2h",
      });

      user.token = token;
      const date = new Date();
      user.expiryTime = Math.round(date.setHours(date.getHours() + 2) / 1000);
      return createResponse(res, 200, "Successfully logged in", user);
    } else {
      return createResponse(res, 400, "Invalid credentials", null);
    }
  } catch (error) {
    console.log(error);
    return createResponse(res, 500, "Internal server error", null);
  }
};

const register = async (req, res) => {
  try {
    const { email, password, password_confirm, role, 
      otherFields } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return createResponse(res, 409, "User already exists", null);
    }
    if (password !== password_confirm) {
      return createResponse(res, 409, "Passwords don't match", null);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === "Itinerant Buyers") {
      user = new userBuyerModel({
        email,
        password: hashedPassword,
        role,
        ...otherFields,
      });
    } else if (role === "User") {
      user = new userRegularModel({
        email,
        password: hashedPassword,
        role,
        ...otherFields,
      });
    } else {
      return createResponse(res, 400, "Invalid role", null);
    }

    try {
      await user.save();
    
      const tokenKey = process.env.TOKEN_KEY;
      if (!tokenKey) {
        return createResponse(
          res,
          500,
          "Internal Server Error: TOKEN_KEY not defined",
          null
        );
      }
    
      const token = jsonwebtoken.sign({ user_id: user._id, email }, tokenKey, {
        expiresIn: "2h",
      });
    
      res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return createResponse(res, 400, "Email cannot be empty", null);
    }
    const user = await User.findOne({ email });
    if (user) {
      const token = await Token.findOne({
        userId: user._id,
      });
      if (token) {
        await Token.deleteOne();
      }
      const resetToken = await bcrypt.hash(Math.random().toString(), 10);
      await new Token({
        userId: user._id,
        token: resetToken,
        createdAt: Date.now(),
      }).save();
      emailHelper.sendMail(
        {
          from: "Formulr Admin",
          to: email,
          subject: "Password Reset Link",
          html: `
            <p>Hello ${user.first_name},</p>
            <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
            <p>Click the following link to reset your password:</p>
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}&email=${email}">
            Reset Password
            </a>
            <p>If the above link doesn't work, copy and paste the following URL into your browser:</p>
            <p>${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}&email=${email}</p>
            <p>This link will expire in 2 hours.</p>
            <p>Best regards,<br/>Formulr Admin</p>
          `,
        },
        (err, info) => {
          if (err) {
            console.error(err);
            return createResponse(
              res,
              400,
              "Something went wrong sending the email",
              null
            );
          } else {
            return createResponse(
              res,
              200,
              "Password reset link sent successfully",
              null
            );
          }
        }
      );
    } else {
      return createResponse(res, 400, "Invalid email", null);
    }
  } catch (error) {
    console.error(error);
    return createResponse(res, 500, "Internal server error", null);
  }
};

const resetPassword = async (req, res) => {
  const { password, passwordConfirm, token, id } = req.body;
  if (password !== passwordConfirm) {
    return createResponse(res, 400, "Passwords do not match", null);
  }
  let passwordResetToken = await Token.findOne({ userId: id }).sort({
    createdAt: -1,
  });

  if (!passwordResetToken) {
    return createResponse(
      res,
      400,
      "Invalid or expired password reset token",
      null
    );
  }
  const isValid = token === passwordResetToken.token;
  if (!isValid) {
    return createResponse(
      res,
      400,
      "Invalid or expired password reset token",
      null
    );
  }

  const user = await User.findById(id);

  const isPreviousPassword = user?.previousPasswords.some((prevPassword) =>
    bcrypt.compareSync(password, prevPassword)
  );

  if (isPreviousPassword) {
    return createResponse(
      res,
      400,
      "Please use a password you haven't used before",
      null
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const previousPasswords = {
    $push: { previousPasswords: { $each: [hashedPassword], $slice: -5 } },
    $set: { password: hashedPassword },
  };

  await Token.deleteOne({ _id: passwordResetToken._id });
  await User.updateOne({ _id: id }, previousPasswords);
  return createResponse(res, 200, "Password successfully changed", null);
};

const deleteAdmin = async (req, res) => {
  try {
    const { email, password, userId } = req.body;

    if (!(email && password)) {
      return createResponse(
        res,
        400,
        "Email and password must be provided",
        null
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return createResponse(res, 404, "User not found", null);
    }

    if (
      user.email !== email ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return createResponse(res, 401, "Invalid email or password", null);
    }

    await User.deleteOne({ _id: userId });

    return createResponse(res, 200, "Successfully deleted user as admin", null);
  } catch (error) {
    console.error(error);
    return createResponse(res, 500, "Internal server error", null);
  }
};

module.exports = {
  login,
  register,
  deleteAdmin,
  forgotPassword,
  resetPassword,
};
