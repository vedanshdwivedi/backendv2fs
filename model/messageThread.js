const { MessageThread } = require("../schema/messageThread");

const create = async (sender, receiver) => {
  return await new MessageThread({ sender, receiver }).save();
};

const get = async (sender, receiver) => {
  return await MessageThread.findOne({
    sender: { $in: [sender, receiver] },
    receiver: { $in: [sender, receiver] },
  });
};

module.exports = {
  create,
  get,
};
