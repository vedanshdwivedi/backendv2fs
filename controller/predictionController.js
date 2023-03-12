const formidable = require("formidable");
const { logger } = require("../logger");
const predictionModel = require("../model/prediction");
const ackLogModel = require("../model/ackLogs");
const projectService = require("../service/project");
const settingsModel = require("../model/Settings");
const projectModel = require("../model/Project");
const blobModel = require("../model/BlobModel");
const fileModel = require("../model/File");
const celeryUtils = require("../utility/celery");

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

const uploadDataset = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const settings = await settingsModel.get(projectId);
    if (!settings.transform) {
      return res
        .status(400)
        .send({ message: "Project is not ready for Predictions" });
    }
    console.log(JSON.stringify(settings));
    if (!projectId) {
      return res.status(404).send({ message: "Project ID is required" });
    }
    const projectData = await projectModel.getProjectById(projectId);
    if (Number(projectData.uid) !== Number(req.user.id)) {
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
    const form = new formidable.IncomingForm();
    let taskPayload = { projectId };
    form.parse(req, async (err, fields, files) => {
      const file = files.file;
      const extension = file.originalFilename.split(".") || [];
      const dateNow = Date.now().toString();
      const blobName = `${dateNow}.${extension[extension.length - 1]}`;
      const containerName = projectData.container;
      const containerClient = await blobModel.getContainerClient(containerName);
      const blobClient = containerClient.getBlockBlobClient(blobName);
      blobClient.uploadFile(file.filepath);
      const uploadedFile = await fileModel.createFileEntry({
        pid: projectId,
        filename: blobName,
        container: containerName,
        downloadLink: blobClient.url,
        category: "PREDICTION_DATASET",
        deleted: false,
      });
      await ackLogModel.createAckLogs({
        userId: Number(req.user.id),
        projectId: projectId,
        agentId: null,
        action: `${req.user.name} Uploaded Prediction Dataset and triggered prediction task`,
      });
      taskPayload["datasetId"] = Number(uploadedFile.fid);
      const taskUrl = `${process.env.CELERY_HOST}/${projectData.algorithm}/predict`;
      try {
        await celeryUtils.triggerCeleryTask(
          projectId,
          Number(req.user.id),
          "QUEUED",
          "PREDICTION",
          taskUrl,
          taskPayload
        );
      } catch (error) {
        await blobModel.deleteFileFromBlob(containerName, blobName);
        await fileModel.deleteFileByFileId(Number(uploadedFile.fid));
        return res
          .status(401)
          .send({ message: "Failed to Trigger Prediction Task" });
      }
      return res.status(200).send({ message: "Prediction File Created" });
    });
  } catch (error) {
    logger.error(
      `[predictionController][uploadDataset] Error in Uploading Prediction Dataset : ${JSON.stringify(
        error
      )} `
    );
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  create,
  getByProjectId,
  uploadDataset,
};
