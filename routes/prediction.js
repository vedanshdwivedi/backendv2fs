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
predictionRouter.post("/:projectId/dataset", validateJWT, predictionController.uploadDataset)


module.exports = {
  predictionRouter,
};
