const { User, validateUser, generateAuthToken } = require("../model/User");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { trackMixPanelEvent } = require("../segment");
const { getCurrentTimeStamp } = require("../utility/datetime");
const { Tokens } = require("../schema/tokens");
const { createTokenEntry } = require("../model/tokens");
const { logger } = require("../logger");

const createUniqueUsername = async (email) => {
  let tryCount = -1;
  let username = email.replace("@", "").replace(".", "");
  while (tryCount < 11) {
    tryCount += 1;
    const user = await User.findOne({ where: { username: username } });
    if (!user) {
      return username;
    } else {
      if (tryCount == 11) {
        trackMixPanelEvent("username-generation-failure", {
          maxCount: tryCount,
          email: email,
        });
        throw new Error("try different email id");
      }
      username = `${username}${tryCount}`;
    }
  }
};

const registerUser = async (req, res) => {
  try {
    const error = validateUser({ ...req.body }) || null;
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      return res.status(409).send({ message: "User with given Email exists" });
    }

    const username = await createUniqueUsername(req.body.email);

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await new User({
      ...req.body,
      password: hashPassword,
      username: username,
      role: "USER",
      createdAt: getCurrentTimeStamp(),
      updatedAt: getCurrentTimeStamp(),
    }).save();
    trackMixPanelEvent(
      "new-user-created",
      { email: req.body.email, name: req.body.name, username },
      username
    );
    return res.status(201).send({ message: "User Created Successfully" });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const validateLoginData = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data).error;
};

const loginUser = async (req, res) => {
  try {
    const error = validateLoginData({ ...req.body }) || null;
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(401).send({ message: "Invalid email/password" });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).send({ message: "Invalid email/password" });
    }

    await Tokens.findOneAndDelete({ userId: Number(user.uid) });
    const token = generateAuthToken(user);
    await createTokenEntry({ userId: Number(user.uid), token });
    return res.status(200).send({
      data: token,
      message: "Logged in Successfully",
      userId: Number(user.uid),
      role: user.role,
      email: user.email,
      username: user.username,
      name: user.name,
    });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    await Tokens.findOneAndDelete({ userId });
    return res.status(200).send({ message: "User Logged Out" });
  } catch (error) {
    logger.error(
      `[authController][logoutUser] Error in Logging out user ${error}`
    );
    return res.status(500).send({ message: "Error Occurred" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
