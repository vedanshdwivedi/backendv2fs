const jwt = require("jsonwebtoken");
const { trackMixPanelEvent } = require("./segment");
const { getTokenEntry } = require("./model/tokens");
const { user } = require("pg/lib/defaults");

const validateJWT = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    const storedToken = await getTokenEntry({ userId: Number(decoded.id) });

    if (storedToken.token !== token) {
      trackMixPanelEvent("Token-Mismatch", {
        url: req.originalUrl,
        error: error.message,
        user: user.id,
      });
    }

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
