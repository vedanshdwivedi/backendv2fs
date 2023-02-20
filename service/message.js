const messageModel = require("../model/message");
const messageThreadModel = require("../model/messageThread");
const _ = require("lodash");

const createMessageThread = async (sender, receiver) => {
  return messageThreadModel.create(sender, receiver);
};

const fetchMessageThread = async (sender, receiver) => {
  return messageThreadModel.get(sender, receiver);
};

const fetchMessageByThreadId = async (threadId) => {
  return await messageModel.getByThreadId(threadId);
};

const saveMessage = async (data) => {
  const sender = _.get(data, "sender");
  const receiver = _.get(data, "receiver");
  let thread;
  if (!sender || !receiver) {
    throw new Error("Sender/Receiver is required ");
  }
  thread = await fetchMessageThread(sender, receiver);
  if (!thread) {
    thread = await createMessageThread(sender, receiver);
  }

  data["threadId"] = thread._id;
  return await messageModel.create(data);
};

module.exports = {
  createMessageThread,
  fetchMessageThread,
  fetchMessageByThreadId,
  saveMessage,
};
