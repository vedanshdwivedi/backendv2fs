const { sequelize } = require("../database/postgres");
const { DataTypes } = require("sequelize");
const { logger } = require("../logger");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const joi = require("joi");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const User = sequelize.define("users", {
  uid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
    type: DataTypes.DATE,
    defaultValue: new Date(),
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
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

sequelize.sync({ force: false }).then(() => {
  // logger.info(`Users Table created!`);
});

const generateAuthToken = function (user) {
  const token = jwt.sign(
    {
      id: _.get(user, "uid"),
      name: _.get(user, "name"),
      email: _.get(user, "email"),
      role: _.get(user, "role"),
      username: _.get(user, "username"),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "4d",
    }
  );
  return token;
};

const validateUser = (data) => {
  const schema = joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    contact: Joi.string(),
  });

  return schema.validate(data).error;
};

const fetchUserByUid = async (uid) => {
  return await User.findOne({ uid });
};

module.exports = {
  generateAuthToken,
  validateUser,
  User,
  fetchUserByUid
};
