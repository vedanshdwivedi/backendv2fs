const formidable = require("formidable");
const { handleContainerCreation } = require("../model/BlobModel");
const { blobService } = require("../database/azureBlob");
const { logger } = require("../logger");
const { encodeObjectToUniqueString } = require("../utility/encoder");
const ackLogsModel = require("../model/ackLogs");
const {
  createFileEntry,
  getAllFilesByProjectId,
  markFilesDeleted,
  getFileByProjectIdAndCategory,
} = require("../model/File");
const {
  getAllProjectByUserId,
  getProjectById,
  Project,
} = require("../model/Project");
const projectService = require("../service/project");
const moment = require("moment");
const e = require("express");
const { trackMixPanelEvent } = require("../segment");
const { getCurrentTimeStamp } = require("../utility/datetime");

const generateContainerName = ({ createdAt, email, username, uid }) => {
  const containerName = encodeObjectToUniqueString({
    createdAt,
    email,
    username,
    uid,
  });
  return containerName;
};

const createProject = async (req, res) => {
  const createdAt = getCurrentTimeStamp();
  const email = req.user.email;
  const username = req.user.username;
  const uid = req.user.id;
  const name = req.user.name;
  let reqData = {};
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    try {
      const file = files.file;
      reqData = { ...fields };
      const extension = file.originalFilename.split(".") || [];
      const blobName = `dataset.${extension[extension.length - 1]}`;
      const containerName = generateContainerName({
        createdAt,
        email,
        username,
        uid,
      });
      const containerClient = await handleContainerCreation(containerName);
      const blobClient = containerClient.getBlockBlobClient(blobName);
      const blobUploadResponse = blobClient.uploadFile(file.filepath);
      let createdProject = await projectService.createProjectService({
        uid,
        title: reqData.project_name,
        description: reqData.description,
        createdAt,
        email: reqData.email,
        algorithm: reqData.algorithm,
        container: containerName,
      });
      await createFileEntry({
        pid: createdProject.pid,
        filename: blobName,
        container: containerName,
        downloadLink: blobClient.url,
        category: "DATASET",
        deleted: false,
      });
      await ackLogsModel.createAckLogs({
        userId: uid,
        projectId: createdProject.pid,
        agentId: null,
        action: `${name} Created Project`,
      });
      res.status(201).send({
        message: "Project Created Successfully",
        data: createdProject,
      });
      trackMixPanelEvent(
        "project-created",
        { algorithm: reqData.algorithm, userId: uid },
        username
      );
    } catch (error) {
      logger.error(
        `[projectController][createProject] Unable to upload file to Blob : ${error.message}`
      );
      res.status(500).send({ message: error.message });
    }
  });
};

const getProjectsByUserId = async (req, res) => {
  try {
    const projects = await getAllProjectByUserId(req.user.id);
    res.status(200).send({ message: "", data: projects });
  } catch (error) {
    logger.error(
      `[projectController][getProjectsByUserId] Unable to fetch projects by userID : ${error.message}`
    );
    res.status(500).send({ message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await getProjectById(req.query.projectId);
    if (!project) {
      res.status(404).send({ message: "Project Not Found" });
    }
    if (req.user.role === "USER" && req.user.id !== Number(project.uid)) {
      res.status(401).send({ message: "Unauthorised" });
    }
    res.status(200).send({ message: "Project Found", data: project });
  } catch (error) {
    logger.error(`[projectController][getProject] Error : ${error}`);
  }
};

const getAllFiles = async (req, res) => {
  try {
    const project = await getProjectById(Number(req.query.projectId));
    if (!project) {
      res.status(404).send({ message: "Invalid Project ID" });
    }
    if (req.user.role === "USER" && req.user.id !== Number(project.uid)) {
      res.status(401).send({ message: "Unauthorised" });
    }
    const files = await getAllFilesByProjectId(Number(req.query.projectId));
    res.status(200).send({ message: "", data: files });
  } catch (error) {
    logger.error(
      `[projectController][getAllFilesByProjectId] Unable to fetch projects by userID : ${error.message}`
    );
    res.status(500).send({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    let project = await getProjectById(projectId);
    project.deleted = true;
    project.save();
    await markFilesDeleted(projectId);
    res.status(200).send({ message: "Project Deleted" });
  } catch (error) {
    logger.error(
      `[projectController][deleteProject] Project has been deleted : ${JSON.stringify(
        error
      )}`
    );
    res.status(500).send({ message: error.message });
  }
};

const fetchProjectTrainingDatasetInfo = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    let project = await getProjectById(projectId);
    if (req.user.role === "USER" && req.user.id !== Number(project.uid)) {
      logger.info(
        `[projectController][fetchProjectTrainingDatasetInfo] Unauthorised Project Access Asked`
      );
      trackMixPanelEvent(
        "unauthorised-project-access",
        {
          uid: req.user.id,
          role: req.user.role,
          projectId: projectId,
          email: req.user.email,
        },
        req.user.username
      );
      res.status(401).send({ message: "Unauthorised" });
    }
    const fileList = await getFileByProjectIdAndCategory(project, "DATASET");
    if (!fileList || fileList.length === 0) {
      res.status(401).send({ message: "File Not Found" });
    }
    res.status(200).send({ message: "File Found", data: fileList[0] });
  } catch (error) {
    logger.info(
      `[projectController][fetchProjectTrainingDatasetInfo] Error in fetching file details : ${error.message}`
    );
    res.status(500).send({ message: error.message });
  }
};

const getAckLogs = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const projectOwner = projectService.doesUserOwnsProject(
      projectId,
      req.user.id
    );
    if (!projectOwner) {
      logger.info(
        `[projectController][getAckLogs] User does not have access to this project `
      );
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
      res.status(401).send({ message: "Unauthorised" });
    }

    const ackLogs = await ackLogsModel.getAckLogs(projectId);
    if (!ackLogs) {
      logger.info(`[projectController][getAckLogs] Ack Logs not found `);
      res.status(200).send({ data: [], message: "Ack Logs not found" });
    }

    res.status(200).send({ data: ackLogs, message: "" });
  } catch (error) {
    res.status(200).send({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjectsByUserId,
  getAllFiles,
  getProject,
  deleteProject,
  fetchProjectTrainingDatasetInfo,
  getAckLogs,
};
