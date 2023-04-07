const messageModel = require("../model/message");
const messageThreadModel = require("../model/messageThread");
const _ = require("lodash");

const saveMessage = async (data) => {
  const sender = _.get(data, "sender");
  const receiver = _.get(data, "receiver");
  const projectId = _.get(data, "projectId");
  const thread = _.get(data, "threadId");
  if (!sender || !receiver || !projectId) {
    throw new Error(
      "[messageService][saveMessage] Sender/Receiver/ProjectId is required "
    );
  }
  return await messageModel.create(data);
};

module.exports = {
  saveMessage,
};
