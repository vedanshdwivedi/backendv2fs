const { MessageThread } = require("../schema/messageThread");

const create = async (sender, receiver, projectId) => {
  return await new MessageThread({ sender, receiver, projectId }).save();
};

const get = async (projectId, sender, receiver) => {
  return await MessageThread.findOne({
    sender: { $in: [sender, receiver] },
    receiver: { $in: [sender, receiver] },
    projectId: projectId,
  });
};

module.exports = {
  create,
  get,
};
