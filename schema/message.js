const mongoose = require("mongoose");
const { mongoDb } = require("../database/mongo");

const messageSchema = new mongoose.Schema(
  {
    projectId: {
      type: Number,
    },
    sender: { type: Number, required: true },
    receiver: { type: Number, required: true },
    content: { type: String, required: true },
    threadId: { type: String, required: true },
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1, projectId: 1 });

const Messages = mongoDb.model("messages", messageSchema);

module.exports = {
  Messages,
};
