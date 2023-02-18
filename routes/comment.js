const { Router } = require("express");
const { validateJWT } = require("../middelware");
const commentController = require("../controller/commentController");

const commentRouter = Router();

commentRouter.get("/:projectId", validateJWT, commentController.get);
commentRouter.post("/", validateJWT, commentController.create);

module.exports = {
  commentRouter,
};
