const mongoose = require("mongoose");
const { trackMixPanelEvent } = require("../segment");
const { logger } = require("../logger");

let mongoDB;
try {
  mongoDb = mongoose.createConnection(process.env.MONGO_CONNECTION_URI);
  logger.info("Connected to MongoDB");
} catch (err) {
  trackMixPanelEvent("Mongo-Connect-Error", {
    status: "failed",
    error: err,
    message: err.message,
  });
  throw error;
}

module.exports = {
  mongoDb,
};
