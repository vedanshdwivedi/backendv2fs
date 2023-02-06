const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { trackMixPanelEvent } = require("./segment");
const { logger } = require("./logger");

const app = express();

dotenv.config();
mongoose.set("strictQuery", true);

app.use(cors());
app.use(cookieParser());
app.use(express.json());

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_URI);
    logger.info("Connected to MongoDB");
    // trackMixPanelEvent("Mongo-Connected", {});
  } catch (error) {
    trackMixPanelEvent("Mongo-Connect-Error", { error });
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  logger.info("MongoDB Disconnected");
});

app.get("/", (req, res) => {
  res.send("App Started");
});

const PORT = 3000;
app.listen(PORT, () => {
  connect();
  trackMixPanelEvent("Backend-Start", { url: "/" });
  logger.info("Listening on PORT : ", PORT);
});
