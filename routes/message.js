const { Router } = require("express");
const { validateJWT } = require("../middelware");
const messageController = require("../controller/messageController.js");

const messageRouter = Router();

messageRouter.post("/send", validateJWT, messageController.send);
messageRouter.get("/thread/:threadId", validateJWT, messageController.getByThreadId);
messageRouter.get("/connectUser", messageController.connectToSocket);

module.exports = {
  messageRouter,
};
