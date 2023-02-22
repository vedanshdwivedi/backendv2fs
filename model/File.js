const { sequelize } = require("../database/postgres");
const { DataTypes } = require("sequelize");
const Joi = require("joi");
const { getCurrentTimeStamp } = require("../utility/datetime");

const File = sequelize.define(
  "files",
  {
    fid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    container: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    downloadLink: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: getCurrentTimeStamp(),
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    updatedAt: false,
  }
);

sequelize.sync({ force: false }).then(() => {});

const validateFile = (data) => {
  const schema = Joi.object({
    pid: Joi.number().required(),
    filename: Joi.string().required(),
    container: Joi.string().required(),
    downloadLink: Joi.string().required(),
    category: Joi.string().required(),
    deleted: Joi.boolean().required(),
  });

  return schema.validate(data).error;
};

const createFileEntry = async (data) => {
  const error = validateFile({ ...data });
  if (error) {
    throw new Error();
  }
  await new File({ ...data }).save();
};

const getAllFilesByProjectId = async (projectId) => {
  return await File.findAll({ pid: projectId, deleted: false });
};

const markFilesDeleted = async (projectId) => {
  return await File.update(
    {
      deleted: true,
    },
    { where: { pid: projectId } }
  );
};

const getFileByProjectIdAndCategory = async (projectId, category) => {
  return await File.findAll({ pid: projectId, category: category });
};

const deleteFileByFileId = async (fileId) => {
  return await File.update({ deleted: tue }, { where: { fid: fileId } });
};

module.exports = {
  validateFile,
  createFileEntry,
  getAllFilesByProjectId,
  markFilesDeleted,
  getFileByProjectIdAndCategory,
  deleteFileByFileId,
  File,
};
