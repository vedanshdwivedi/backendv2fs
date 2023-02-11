const { User, validateUser, generateAuthToken } = require("../model/User");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const { trackMixPanelEvent } = require("../segment");

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
      createdAt: new Date().toLocaleString("en-US", { timezone: "UTC" }),
      updatedAt: new Date().toLocaleString("en-US", { timezone: "UTC" }),
    }).save();
    trackMixPanelEvent(
      "new-user-created",
      { email: req.body.email, name: req.body.name, username },
      username
    );
    res.status(201).send({ message: "User Created Successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
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

    const token = generateAuthToken(user);
    res.status(200).send({ data: token, message: "Logged in Successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
