const { Router } = require("express");
const predictionController = require("../controller/predictionController");
const { validateJWT } = require("../middelware");

const predictionRouter = Router();

predictionRouter.post("/", validateJWT, predictionController.create);
predictionRouter.get(
  "/:projectId",
  validateJWT,
  predictionController.getByProjectId
);

module.exports = {
  predictionRouter,
};
