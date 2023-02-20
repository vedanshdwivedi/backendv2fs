const { Router } = require("express");
const { validateJWT } = require("../middelware");
const messageController = require("../controller/messageController.js");

const messageRouter = Router();

messageRouter.post("/send", validateJWT, messageController.send);
messageRouter.get("/:threadId", validateJWT, messageController.getByThreadId);

module.exports = {
  messageRouter,
};
