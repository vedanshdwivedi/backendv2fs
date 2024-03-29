const pino = require("pino");
const fs = require("fs");

const transport = pino.transport({
  targets: [
    {
      level: "info",
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "UTC:dd-mm-yyyy HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
    {
      level: "trace",
      target: "pino/file",
      options: {
        colorize: true,
        destination: "./logs.log",
        translateTime: "UTC:dd-mm-yyyy HH:MM:ss",
        ignore: "pid,hostname",
      },
    },
  ],
});

const logger = pino(transport);

module.exports = {
  logger,
};
