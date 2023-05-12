const { Router } = require("express");
const { validateJWT } = require("../middelware");
const projectController = require("../controller/projectController");
const stateHandler = require("../utility/stateValidator");

const projectRouter = Router();

projectRouter.post("/", validateJWT, projectController.createProject);
projectRouter.get("/files", validateJWT, projectController.getAllFiles);
projectRouter.post(
  "/dev/projectList",
  validateJWT,
  projectController.getProjectByDevAndStatus
);
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

projectRouter.get(
  "/agentAvailability/:algorithm",
  projectController.getAvailableAgents
);

projectRouter.get("/nextState/:state", (req, res) => {
  try {
    const currentState = req.params.state;
    if (!currentState) {
      return res.status(404).send({ message: "Current State not Passed" });
    }
    const data = stateHandler.getNextStates(currentState);
    return res
      .status(200)
      .send({ message: "States Fetched Successfully", data: data });
  } catch (error) {
    return res.status(401).send({ message: error.message });
  }
});

projectRouter.post(
  "/status",
  validateJWT,
  projectController.updateProjectStatus
);

module.exports = {
  projectRouter,
};
