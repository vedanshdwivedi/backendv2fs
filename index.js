const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { trackMixPanelEvent } = require("./segment");
const { logger } = require("./logger");
const { authRouter } = require("./routes/auth");

const app = express();

dotenv.config();
mongoose.set("strictQuery", true);

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("App Started");
});

const PORT = 5500;
app.listen(PORT, () => {
  // connect();
  trackMixPanelEvent("Backend-Start", { url: "/" });
  logger.info(`Listening on PORT : ${PORT}`);
});
