const mongoose = require("mongoose");
const { DataTypes } = require("sequelize");
const { mongoDb } = require("../database/mongo");

const settingsSchema = new mongoose.Schema(
  {
    projectId: {type: Number, required: true},
    algorithm: {type: String, required: true},
    dataset: {type: Boolean, default: false},
    features: {type: [String], default: []},
    label: {type: String, default: ''},
    ready: {type: Boolean, default: false},
    transform: {type: Boolean, default: false},
    paramsGrid: {type: Object},
  },
  { timestamps: true }
);

settingsSchema.index({ projectId: 1 });

const Settings = mongoDb.model("settings", settingsSchema);

module.exports = {
  Settings,
};

