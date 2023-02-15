const { sequelize } = require("../database/postgres");
const { DataTypes } = require("sequelize");
const { logger } = require("../logger");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const joi = require("joi");
const Joi = require("joi");
const { getCurrentTimeStamp } = require("../utility/datetime");

const Project = sequelize.define("projects", {
  pid: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  uid: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "INITIALISED",
  },
  developer: {
    type: DataTypes.STRING,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: getCurrentTimeStamp(),
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: getCurrentTimeStamp(),
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expert: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  algorithm: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  container: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

sequelize.sync({ force: false }).then(() => {
  // logger.info(`Users Table created!`);
});

const validateProject = (data) => {
  const schema = joi.object({
    uid: Joi.number().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string().required(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
    expert: Joi.string().required(),
    email: Joi.string().email().required(),
    algorithm: Joi.string().required(),
    container: Joi.string().required(),
  });

  return schema.validate(data).error;
};

const createProjectEntry = async (data) => {
  const error = validateProject({ ...data });
  if (error) {
    throw new Error(error.details[0].message);
  }
  return await new Project({ ...data }).save();
};

const getAllProjectByUserId = async (userId) => {
  return await Project.findAll({
    where: { uid: userId, deleted: false },
    order: [["createdAt", "DESC"]],
  });
};

const getProjectById = async (projectId) => {
  return await Project.findOne({ projectId: projectId, deleted: false });
};

module.exports = {
  validateProject,
  Project,
  createProjectEntry,
  getAllProjectByUserId,
  getProjectById,
};
