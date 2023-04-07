const mongoose = require("mongoose");
const { mongoDb } = require("../database/mongo");

const notificationsSchema = new mongoose.Schema(
  {
    projectId: Number,
    action: String,
    read: Boolean,
  },
  { timestamps: true }
);

notificationsSchema.index({ projectId: 1 });

const Notifications = mongoDb.model("notifications", notificationsSchema);

module.exports = {
  Notifications,
};
