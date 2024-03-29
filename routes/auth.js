const { Router } = require("express");
const authController = require("../controller/authController");
const { validateJWT } = require("../middelware");

const authRouter = Router();

authRouter.post("/", authController.registerUser);
authRouter.post("/login", authController.loginUser);
authRouter.post("/logout", validateJWT, authController.logoutUser);
authRouter.get("/user", validateJWT, authController.fetchUser);

module.exports = {
  authRouter,
};
