const { sequelize } = require("../database/postgres");
const { DataTypes } = require("sequelize");

const Algorithm = sequelize.define(
  "algorithm",
  {
    algoId: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    algorithmName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    algorithmCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    timestamps: true,
    updatedAt: false,
  }
);

sequelize.sync({ force: false });

const getById = async (id) => {
  return await Algorithm.findOne({ algoId: id });
};

const getByCode = async (code) => {
  return await Algorithm.findOne({ algorithmCode: code });
};

const get = async () => {
  return await Algorithm.findAll();
};

module.exports = {
  get,
  getById,
  getByCode,
  Algorithm,
};
