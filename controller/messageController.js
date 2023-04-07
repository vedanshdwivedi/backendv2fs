const { isObjectIdOrHexString } = require("mongoose");
const { logger } = require("../logger");
const messageService = require("../service/message");
const messageModel = require("../model/message");
const { customEmitter } = require("../utility/eventHandler");

const send = async (req, res) => {
  try {
    const msg = await messageService.saveMessage(req.body);
    if (msg) {
    }
    return res
      .status(201)
      .send({ message: "Message Sent Successfully", data: msg });
  } catch (error) {
    logger.error(
      `[messageController][send] Error in Sending Message : ${JSON.stringify(
        error
      )}`
    );
    return res.status(500).send({ error: error.message });
  }
};

const getByThreadId = async (req, res) => {
  try {
    const threadId = req.params.threadId;
    const msgThread = await messageModel.getByThreadId(threadId);
    if (!msgThread) {
      return res.status(404).send({ message: "Not Found", data: [] });
    }
    return res.status(200).send({ data: msgThread });
  } catch (error) {
    logger.error(
      `[messageController][getByThreadId] Error in Sending Message : ${JSON.stringify(
        error
      )}`
    );
    return res.status(500).send({ error: error.message });
  }
};

const connectToSocket = async (req, res) => {
  try {
    customEmitter.emit("connection");
    return res.status(200).send({ message: "Event Emitted" });
  } catch (error) {
    logger.error(
      `[messageController][connectToSocket] Error in Connecting to Socket : ${JSON.stringify(
        error
      )}`
    );
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  getByThreadId,
  send,
  connectToSocket,
};
