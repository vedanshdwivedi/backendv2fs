const { Router } = require("express");
const { validateJWT } = require("../middelware");
const projectController = require("../controller/projectController");

const projectRouter = Router();

projectRouter.post("/", validateJWT, projectController.createProject);
projectRouter.get("/files", validateJWT, projectController.getAllFiles);
projectRouter.get("/", validateJWT, projectController.getProjectsByUserId);
projectRouter.delete(
  "/:projectId",
  validateJWT,
  projectController.deleteProject
);
projectRouter.get(
  "/dataset/:projectId",
  validateJWT,
  projectController.fetchProjectTrainingDatasetInfo
);
projectRouter.get(
  "/ackLogs/:projectId",
  validateJWT,
  projectController.getAckLogs
);

projectRouter.get(
  "/:projectId/thread",
  validateJWT,
  projectController.getThreadDataByProject
);

projectRouter.post("/update", validateJWT, projectController.updateProjectInfo);
projectRouter.post(
  "/:projectId/update/dataset",
  validateJWT,
  projectController.updateProjectDataset
);
projectRouter.get(
  "/settings/:projectId",
  validateJWT,
  projectController.getProjectSettings
);

module.exports = {
  projectRouter,
};
