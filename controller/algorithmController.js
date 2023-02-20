const { logger } = require("../logger");
const algorithmModel = require("../model/Algorithm");

const get = async (req, res) => {
  try {
    const algorithms = await algorithmModel.get();
    return res
      .status(200)
      .send({ message: "Algorithms Fetched", data: algorithms });
  } catch (error) {
    logger.error(`[algorithmController][get] Error in Fetching Algorithms `);
    return res.status(500).send({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const id = req.params.id;
    const algorithms = await algorithmModel.getById(id);
    return res
      .status(200)
      .send({ message: "Algorithms Fetched", data: algorithms });
  } catch (error) {
    logger.error(
      `[algorithmController][getById] Error in Fetching Algorithms `
    );
    return res.status(500).send({ message: error.message });
  }
};

const getByCode = async (req, res) => {
  try {
    const code = req.params.code;
    const algorithms = await algorithmModel.getByCode(code);
    return res
      .status(200)
      .send({ message: "Algorithms Fetched", data: algorithms });
  } catch (error) {
    logger.error(
      `[algorithmController][getByCode] Error in Fetching Algorithms `
    );
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  get,
  getById,
  getByCode,
};
