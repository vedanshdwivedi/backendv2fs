const Joi = require("joi");
const { logger } = require("../logger");
const { AckLogs } = require("../schema/ackLogs");

const validateAckLogs = (data) => {
  const schema = Joi.object({
    userId: Joi.number().required(),
    projectId: Joi.number().required(),
    action: Joi.string().required(),
    agentId: Joi.string().allow(null),
  });

  return schema.validate(data).error;
};

async function createAckLogs({ userId, projectId, agentId, action }) {
  const error = validateAckLogs({ userId, projectId, agentId, action });
  if (error) {
    logger.error(
      `[ackLogsModel][createAckLogs] Error in Activity Log Validation : ${error.details[0].message} `
    );
    throw new Error(
      `[ackLogsModel][createAckLogs] Error in Activity Log Validation : ${error.details[0].message} `
    );
  }
  await AckLogs.create({
    userId,
    projectId,
    action,
    agentId,
  });
}

async function getAckLogs(projectId) {
  return await AckLogs.find({
    where: { projectId },
  }).sort({ createdAt: -1 });
}

module.exports = {
  createAckLogs,
  getAckLogs,
};
