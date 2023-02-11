const { sequelize } = require("../database/postgres");
const { DataTypes } = require("sequelize");
const User = require("./User");

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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact: {
    type: DataTypes.STRING,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.TIME,
    defaultValue: Date.now(),
  },
  updatedAt: {
    type: DataTypes.TIME,
    defaultValue: Date.now(),
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profilePic: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
  },
});

User.hasOne(Agent);

sequelize.sync({ force: false }).then(() => {
  logger.info(`Agents Table created!`);
});

module.exports = Agent;
