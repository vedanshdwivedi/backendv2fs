const mongoose = require("mongoose");
const { mongoDb } = require("../database/mongo");

const ackLogsSchema = new mongoose.Schema(
  {
    userId: String,
    projectId: Number,
    agentId: String,
    action: String,
  },
  { timestamps: true }
);

ackLogsSchema.index({ userId: 1, projectId: 1, agentId: 1 });

const AckLogs = mongoDb.model("ackLogs", ackLogsSchema);

module.exports = {
  AckLogs,
};
