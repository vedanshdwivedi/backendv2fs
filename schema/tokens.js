const mongoose = require("mongoose");
const { mongoDb } = require("../database/mongo");

const tokenSchema = new mongoose.Schema(
  {
    userId: Number,
    token: String
  },
  { timestamps: true }
);

tokenSchema.index({ userId: 1 });

const Tokens = mongoDb.model("tokens", tokenSchema);

module.exports = {
  Tokens,
};
