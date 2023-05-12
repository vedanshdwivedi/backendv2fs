const { sequelize } = require("../database/postgres");
const { DataTypes, Op } = require("sequelize");
const User = require("./User");
const { getCurrentTimeStamp } = require("../utility/datetime");
const { logger } = require("../logger");

const Agent = sequelize.define("agents", {
  aid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  uid: {
    type: DataTypes.INTEGER,
    references: {
      model: "users",
      key: "uid",
    },
  },
  blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  maxConcurrency: {
    type: DataTypes.BIGINT,
    defaultValue: 50,
  },
  currentConcurrency: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },
  totalProjects: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
  },
  algorithm: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: getCurrentTimeStamp(),
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: getCurrentTimeStamp(),
  },
});

sequelize.sync({ force: false }).then(() => {
  logger.info(`Agents Table created!`);
});

const getAvailableAgentsByAlgorithm = async (algorithm) => {
  return Agent.findAll({
    where: {
      blocked: false,
      algorithm: algorithm,
      [Op.and]: {
        maxConcurrency: {
          [Op.gt]: sequelize.col("currentConcurrency"),
        },
      },
    },
    order: [
      ["currentConcurrency", "ASC"],
      ["updatedAt", "ASC"],
    ],
  });
};

const updateCurrentConcurrency = async (agentUid, increment) => {
  const agent = await Agent.findOne({ uid: agentUid });
  if (!agent) {
    logger.info(`[agentModel][updateCurrentConcurrency] No Agent Found`);
  }
  return await agent.update({
    currentConcurrency: agent.currentConcurrency + increment,
  });
};

module.exports = {
  Agent,
  getAvailableAgentsByAlgorithm,
  updateCurrentConcurrency,
};
