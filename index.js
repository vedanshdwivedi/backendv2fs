const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const socketio = require("socket.io");
const http = require("http");
const { trackMixPanelEvent } = require("./segment");
const eventEmitter = require("events");
const { logger } = require("./logger");
const { authRouter } = require("./routes/auth");
const { projectRouter } = require("./routes/project");
const { commentRouter } = require("./routes/comment");
const { messageRouter } = require("./routes/message");
const { algorithmRouter } = require("./routes/algorithm");
const { predictionRouter } = require("./routes/prediction");
const { taskRouter } = require("./routes/tasks");
const messageService = require("./service/message");

const app = express();

dotenv.config();
mongoose.set("strictQuery", true);

// Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/project", projectRouter);
app.use("/api/comment", commentRouter);
app.use("/api/message", messageRouter);
app.use("/api/algorithm", algorithmRouter);
app.use("/api/prediction", predictionRouter);
app.use("/api/tasks", taskRouter);

app.get("/", (req, res) => {
  res.send("App Started");
});

const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

const PORT = 5500;
server.listen(PORT, () => {
  logger.info(`Listening on PORT : ${PORT}`);
});

io.on("connection", (socket) => {
  const threadId = socket.handshake.query.threadId;

  if (!threadId) {
    return;
  }

  socket.join(threadId);

  socket.on("send message", async (data) => {
    const savedMessage = await messageService.saveMessage(data);
    io.to(threadId).emit("new message", savedMessage);
  });
});
