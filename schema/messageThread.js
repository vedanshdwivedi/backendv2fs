const mongoose = require("mongoose");
const { mongoDb } = require("../database/mongo");

const messageThreadSchema = new mongoose.Schema(
  {
    sender: { type: Number, required: true },
    receiver: { type: Number, required: true },
  },
  { timestamps: true }
);

messageThreadSchema.index({ senderId: 1, receiverId: 1 });

const MessageThread = mongoDb.model("messageThreads", messageThreadSchema);

module.exports = {
    MessageThread,
};
