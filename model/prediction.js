const { sequelize } = require("../database/postgres");
const { DataTypes } = require("sequelize");
const { logger } = require("../logger");
const joi = require("joi");

const Prediction = sequelize.define(
  "predictions",
  {
    taskId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    pid: {
      type: DataTypes.BIGINT,
    },
    uid: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    graphId: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
  }
);

sequelize.sync({ force: false }).then(() => {});

const validateData = (data) => {
  const schema = joi.object({
    pid: joi.number().required(),
    role: joi.string().required(),
    uid: joi.number().required(),
    status: joi.string().required(),
  });

  return schema.validate(data).error;
};

const create = async (data) => {
  const error = validateData({ ...data });
  if (error) {
    return new Error(error.details[0].message);
  }
  return await new Prediction({ ...data }).save();
};

const getByPid = async (projectId) => {
  return await Prediction.findAll({
    where: { pid: projectId },
    order: [["createdAt", "DESC"]],
  });
};

module.exports = {
  Prediction,
  create,
  validateData,
  getByPid,
};
