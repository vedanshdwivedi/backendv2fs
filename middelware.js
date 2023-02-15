const jwt = require("jsonwebtoken");
const { trackMixPanelEvent } = require("./segment");

const validateJWT = (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    trackMixPanelEvent("Unauthorised-API-Access", {
      url: req.originalUrl,
      token: req.header("Authorization").replace("Bearer ", ""),
      error: error.message,
    });
    return res.status(401).json({ message: "Unauthorised" });
  }
};

module.exports = {
  validateJWT,
};
