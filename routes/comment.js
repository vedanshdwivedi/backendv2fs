const { Router } = require("express");
const { validateJWT } = require("../middelware");
const commentController = require("../controller/commentController");

const commentRouter = Router();

commentController.get("/:projectId", validateJWT, commentController.get);
commentController.post("/", validateJWT, commentController.create);

module.exports = {
  commentRouter,
};
