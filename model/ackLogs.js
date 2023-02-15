const { AckLogs } = require("../schema/ackLogs");

async function createAckLogs({ userId, projectId, agentId, action }) {
  await AckLogs.create({
    userId,
    projectId,
    action,
    agentId,
  });
}

module.exports = {
  createAckLogs,
};
