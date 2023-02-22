const Joi = require("joi");
const { Messages } = require("../schema/message");

async function get(threadId) {
  return await Messages.find({ threadId });
}

const validateMessage = (data) => {
  const schema = Joi.object({
    projectId: Joi.string().required(),
    sender: Joi.string().required(),
    receiver: Joi.string().required(),
    content: Joi.string().required(),
    threadId: Joi.number().required(),
  });

  schema.validate(data).error;
};

async function create(data) {
  const error = validateMessage({ ...data });
  if (error) {
    throw new Error(error.details[0].mesaage);
  }
  return await new Messages(data).save();
}

async function getByThreadId(threadId) {
  return await Messages.find({ threadId: threadId });
}

module.exports = {
  get,
  create,
  validateMessage,
  getByThreadId,
};
