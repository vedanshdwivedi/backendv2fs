const { AckLogs } = require("../schema/ackLogs");

async function createAckLogs({ userId, projectId, agentId, action }) {
  await AckLogs.create({
    userId,
    projectId,
    action,
    agentId,
  });
}

async function getAckLogs(projectId) {
  return await AckLogs.findAll({ projectId });
}

module.exports = {
  createAckLogs,
  getAckLogs,
};
