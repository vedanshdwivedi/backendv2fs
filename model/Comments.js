const { sequelize } = require("../database/postgres");
const { DataTypes } = require("sequelize");
const { logger } = require("../logger");
const Joi = require("joi");

const Comment = sequelize.define(
  "comments",
  {
    cid: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    comment: {
      type: DataTypes.STRING,
    },
    pid: {
      type: DataTypes.BIGINT,
    },
    role: {
      type: DataTypes.STRING,
    },
    uid: {
      type: DataTypes.BIGINT,
    },
  },
  {
    timestamps: true,
    updatedAt: false,
  }
);

sequelize.sync({ force: false }).then(() => {});

const validateData = (data) => {
  const schema = joi.object({
    comment: Joi.string().required(),
    pid: Joi.number().required(),
    role: Joi.string().required(),
    uid: Joi.number().required(),
  });

  return schema.validate(data).error;
};

const create = async (data) => {
  return await new Comment({ ...data }).save();
};

const get = async (projectId) => {
  return await Comment.findAll({
    where: { pid: projectId },
    order: ["createdAt", "DESC"],
  });
};

module.exports = {
  Comment,
  create,
  validateData,
  get,
};
