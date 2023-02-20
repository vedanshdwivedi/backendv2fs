const { Router } = require("express");
const AlgorithmController = require("../controller/algorithmController");

const algorithmRouter = Router();

algorithmRouter.get("/", AlgorithmController.get);
algorithmRouter.get("/:id", AlgorithmController.getById);
algorithmRouter.get("/code/:code", AlgorithmController.getByCode);

module.exports = {
  algorithmRouter,
};
