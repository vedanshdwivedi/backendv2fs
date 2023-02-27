const { logger } = require("../logger");
const predictionModel = require("../model/prediction");
const ackLogModel = require("../model/ackLogs");
const projectService = require("../service/project");

const create = async (req, res) => {
  try {
    projectId = req.body.projectId;
    if (!projectId) {
      return res.status(401).send({ message: "ProjectID is required" });
    }
    const projectOwner = await projectService.doesUserOwnsProject(
      Number(projectId),
      Number(req.user.id)
    );
    if (!projectOwner) {
      trackMixPanelEvent(
        "unauthorised-project-access",
        {
          uid: req.user.id,
          role: req.user.role,
          projectId: projectId,
          email: req.user.email,
          url: req.originalUrl,
        },
        req.user.username
      );
      return res.status(401).send({ message: "Unauthorised" });
    }
    await predictionModel.create({
      pid: projectId,
      role: req.user.role,
      uid: Number(req.user.id),
      status: "QUEUED",
    });
    await ackLogModel.createAckLogs({
      userId: Number(req.user.id),
      projectId,
      agentId: "",
      action: `${req.user.name} created a prediction Task`,
    });
    return res.status(201).send({ message: "Prediction Task Queued " });
  } catch (error) {
    logger.error(
      `[predictionController][create] Error in Creating Prediction : ${JSON.stringify(
        error
      )} `
    );
    return res.status(500).send({ error: error, message: error.message });
  }
};

const getByProjectId = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) {
      return res.status(404).send({ message: "Project ID is required" });
    }
    const checkOwner = await projectService.doesUserOwnsProject(
      Number(projectId),
      Number(req.user.id)
    );
    if (!checkOwner) {
      trackMixPanelEvent(
        "unauthorised-project-access",
        {
          uid: req.user.id,
          role: req.user.role,
          projectId: projectId,
          email: req.user.email,
          url: req.originalUrl,
        },
        req.user.username
      );
      return res.status(401).send({ message: "Unauthorised" });
    }
    const predictions = await predictionModel.getByPid(projectId);
    return res
      .status(200)
      .send({ message: "Predictions Fetched Successfully", data: predictions });
  } catch (error) {
    logger.error(
      `[predictionController][getByProjectId] Error in Fetching Predictions : ${JSON.stringify(
        error
      )} `
    );
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  create,
  getByProjectId,
};
