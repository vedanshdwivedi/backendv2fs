const { Client } = require("pg");
const { logger } = require("../logger");
const { trackMixPanelEvent } = require("../segment");
const { Sequelize, DataTypes } = require("sequelize");

const client = new Client({
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  port: process.env.POSTGRES_PORT,
  ssl: true,
});

client
  .connect()
  .then(() => {
    logger.info("Postgres Connected");
    trackMixPanelEvent("postgres-connection-backend", { status: "successful" });
  })
  .catch((e) => {
    logger.info("Postgres Connection Failed", e);
    trackMixPanelEvent("postgres-connection-backend", {
      status: "failed",
      error: e,
      message: e.message,
    });
  });

// const sequelize = new Sequelize(process.env.POSTGRES_URI);
const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  logging: (log) => {
    if (log.includes('error')) {
      console.error(log); // Display the error logs
    }
  },
});

module.exports = {
  // client,
  sequelize,
};
