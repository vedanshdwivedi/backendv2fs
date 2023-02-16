const { Router } = require("express");
const authController = require("../controller/authController");

const authRouter = Router();

authRouter.post("/", authController.registerUser);
authRouter.post("/login", authController.loginUser);
authRouter.post("/logout", authController.logoutUser);

module.exports = {
  authRouter,
};
