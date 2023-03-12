const { sequelize } = require("../database/postgres");
const { DataTypes } = require("sequelize");
const Joi = require("joi");
const { allow } = require("joi");

const Task = sequelize.define("predictions", {
  taskId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  pid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  uid: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "QUEUED",
  },
  graphId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payload: {
    type: DataTypes.JSON,
  },
});

sequelize.sync({ force: false }).then(() => {
  // logger.info(`Users Table created!`);
});

const validateTaskData = (data) => {
  const schema = Joi.object({
    pid: Joi.number().required(),
    uid: Joi.number().required(),
    status: Joi.string().required(),
    type: Joi.string().valid("PREDICTION", "TRAINING").required(),
    url: Joi.string().required(),
  }).options({ allowUnknown: true });

  return schema.validate(data).error;
};

const create = async (data) => {
  const error = validateTaskData({ ...data });
  if (error) {
    throw new Error(error.details[0].message);
  }
  return await new Task({ ...data }).save();
};

const getByProjectId = async (projectId) => {
  return await Task.findAll({ pid: projectId });
};

const getByTaskId = async (taskId) => {
  return await Task.findOne({ taskId });
};

module.exports = {
  create,
  getByProjectId,
  getByTaskId,
};
