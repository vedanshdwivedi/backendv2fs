const { logger } = require("../logger");
const messageService = require("../service/message");

const send = async (req, res) => {
  try {
    const msg = await messageService.saveMessage(req.body);
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
    const msgThread = await messageService.fetchMessageByThreadId(threadId);
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

module.exports = {
  getByThreadId,
  send,
};
