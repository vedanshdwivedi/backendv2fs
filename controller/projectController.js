const formidable = require("formidable");
const {
  handleContainerCreation,
  getContainerClient,
  deleteFileFromBlob,
} = require("../model/BlobModel");
const { logger } = require("../logger");
const { encodeObjectToUniqueString } = require("../utility/encoder");
const ackLogsModel = require("../model/ackLogs");
const fileModel = require("../model/File");
const projectModel = require("../model/Project");
const settingsModel = require("../model/Settings");
const projectService = require("../service/project");
const { trackMixPanelEvent } = require("../segment");
const { getCurrentTimeStamp } = require("../utility/datetime");
const messageThreadModel = require("../model/messageThread");
const userModel = require("../model/User");
const assignmentService = require("../service/assignment");

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
      await blobClient.uploadFile(file.filepath);
      let createdProject = await projectService.createProjectService({
        uid,
        title: reqData.project_name,
        description: reqData.description,
        createdAt,
        email: reqData.email,
        algorithm: reqData.algorithm,
        container: containerName,
      });
      await assignmentService.assignAgentToProject(createdProject);
      await settingsModel.init(Number(createdProject.pid), reqData.algorithm);
      await fileModel.createFileEntry({
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
      trackMixPanelEvent(
        "project-created",
        { algorithm: reqData.algorithm, userId: uid },
        username
      );
      return res.status(201).send({
        message: "Project Created Successfully",
        data: createdProject,
      });
    } catch (error) {
      logger.error(
        `[projectController][createProject] Unable to upload file to Blob : ${JSON.stringify(
          error
        )}`
      );
      return res.status(500).send({ message: error.message });
    }
  });
};

const updateProjectDataset = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    if (!projectId) {
      return res.status(401).send({ message: "Project ID is required" });
    }
    const project = await projectModel.getProjectById(projectId);
    if (!project) {
      return res.status(404).send({ message: "Project Not Found", data: null });
    }
    if (Number(project.uid) !== Number(req.user.id)) {
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
    const existingFile = await fileModel.getFileByProjectIdAndCategory(
      projectId,
      "DATASET"
    );
    if (existingFile && existingFile.length > 0) {
      await fileModel.deleteFileByFileId(existingFile[0].fid);
      await deleteFileFromBlob(project.container, existingFile[0].filename);
    }
    const form = new formidable.IncomingForm();
    let updatedFile;
    form.parse(req, async (err, fields, files) => {
      try {
        const file = files.file;
        reqData = { ...fields };
        const extension = file.originalFilename.split(".") || [];
        const blobName = `dataset.${extension[extension.length - 1]}`;
        const containerName = project.container;
        const containerClient = await getContainerClient(containerName);
        const blobClient = containerClient.getBlockBlobClient(blobName);
        await blobClient.uploadFile(file.filepath);
        updatedFile = await fileModel.createFileEntry({
          pid: projectId,
          filename: blobName,
          container: project.container,
          downloadLink: blobClient.url,
          category: "DATASET",
          deleted: false,
        });
        await ackLogsModel.createAckLogs({
          userId: req.user.id,
          projectId: projectId,
          agentId: null,
          action: `${req.user.name} Updated Project Training Dataset`,
        });
      } catch (error) {
        logger.error(
          `[projectController][updateProjectDataset] Error in Saving the File : ${JSON.stringify(
            error
          )} `
        );
        throw error;
      }
    });
    return res
      .status(200)
      .send({ message: "Training File Updated", data: updatedFile });
  } catch (error) {
    logger.error(
      `[projectController][updateProjectDataset] Error in updating training dataset : ${JSON.stringify(
        error
      )}`
    );
    return res.status(500).send({ message: error.message, data: error });
  }
};

const getProjectsByUserId = async (req, res) => {
  try {
    const projects = await projectModel.getAllProjectByUserId(req.user.id);
    return res.status(200).send({ message: "", data: projects });
  } catch (error) {
    logger.error(
      `[projectController][getProjectsByUserId] Unable to fetch projects by userID : ${JSON.stringify(
        error
      )}`
    );
    return res.status(500).send({ message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await projectModel.getProjectById(req.query.projectId);
    if (!project) {
      return res.status(404).send({ message: "Project Not Found" });
    }
    if (req.user.role === "USER" && req.user.id !== Number(project.uid)) {
      return res.status(401).send({ message: "Unauthorised" });
    }
    return res.status(200).send({ message: "Project Found", data: project });
  } catch (error) {
    logger.error(
      `[projectController][getProject] Error : ${JSON.stringify(error)}`
    );
  }
};

const getProjectByDevAndStatus = async (req, res) => {
  try {
    const projectStatus = req.body.status;
    const developer = req.body.developer;
    let projectList;
    if (projectStatus === "all") {
      projectList = await projectModel.getAllProjectsByDeveloper(developer);
    } else {
      projectList = await projectModel.getProjectsByDevAndStatus(
        developer,
        projectStatus
      );
    }
    return res.status(200).send({
      message: "Projects Fetched Successfully",
      projects: projectList,
    });
  } catch (error) {
    logger.error(
      `[projectController][getProjectByDevAndStatus] Error : ${JSON.stringify(
        error
      )}`
    );
  }
};

const getAllFiles = async (req, res) => {
  try {
    const project = await projectModel.getProjectById(
      Number(req.query.projectId)
    );
    if (!project) {
      return res.status(404).send({ message: "Invalid Project ID" });
    }
    if (req.user.role === "USER" && req.user.id !== Number(project.uid)) {
      return res.status(401).send({ message: "Unauthorised" });
    }
    const files = await fileModel.getAllFilesByProjectId(
      Number(req.query.projectId)
    );
    return res.status(200).send({ message: "", data: files });
  } catch (error) {
    logger.error(
      `[projectController][getAllFilesByProjectId] Unable to fetch projects by userID : ${JSON.stringify(
        error
      )}`
    );
    return res.status(500).send({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    let project = await projectModel.getProjectById(projectId);
    project.deleted = true;
    project.save();
    await fileModel.markFilesDeleted(projectId);
    return res.status(200).send({ message: "Project Deleted" });
  } catch (error) {
    logger.error(
      `[projectController][deleteProject] Project has been deleted : ${JSON.stringify(
        error
      )}`
    );
    return res.status(500).send({ message: error.message });
  }
};

const fetchProjectTrainingDatasetInfo = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    let project = await projectModel.getProjectById(projectId);
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
      return res.status(401).send({ message: "Unauthorised" });
    }
    const fileList = await fileModel.getFileByProjectIdAndCategory(
      project,
      "DATASET"
    );
    if (!fileList || fileList.length === 0) {
      return res.status(401).send({ message: "File Not Found" });
    }
    return res.status(200).send({ message: "File Found", data: fileList[0] });
  } catch (error) {
    logger.info(
      `[projectController][fetchProjectTrainingDatasetInfo] Error in fetching file details : ${error.message}`
    );
    return res.status(500).send({ message: error.message });
  }
};

const getAckLogs = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const projectOwner = projectService.doesUserOwnsProject(
      projectId,
      req.user.id,
      req.user.role
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
      return res.status(401).send({ message: "Unauthorised" });
    }

    const ackLogs = await ackLogsModel.getAckLogs(projectId);
    if (!ackLogs) {
      logger.info(`[projectController][getAckLogs] Ack Logs not found `);
      return res.status(200).send({ data: [], message: "Ack Logs not found" });
    }

    return res.status(200).send({ data: ackLogs, message: "" });
  } catch (error) {
    return res.status(200).send({ message: error.message });
  }
};

const getThreadDataByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await projectModel.getProjectById(projectId);
    if (
      Number(project.uid) !== Number(req.user.id) &&
      req.user.role !== "DEVELOPER"
    ) {
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
      return res.status(404).send({ data: "Unauthorised Access" });
    }
    let thread;
    let sender;
    let receiver;
    if (req.user.role === "USER") {
      sender = project.developer;
      receiver = req.user.username;
    } else {
      // For Developers
      sender = req.user.username;
      const projectOwner = await userModel.fetchUserByUid(project.uid);
      if (!projectOwner) {
        return res.status(404).send({ data: "Project Owner not found" });
      }
      receiver = projectOwner.username;
    }
    thread = await messageThreadModel.get(Number(projectId), sender, receiver);
    if (!thread) {
      thread = await messageThreadModel.create(
        sender,
        receiver,
        Number(projectId)
      );
    }
    return res
      .status(200)
      .send({ message: "Fetched Message Thread", data: thread });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
};

const updateProjectInfo = async (req, res) => {
  try {
    const projectId = req.body.projectId;
    const project = await projectModel.getProjectById(projectId);
    if (!project) {
      return res.status(404).send({ message: "Project Not Found" });
    }
    if (Number(project.uid) !== Number(req.user.id)) {
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
    const data = {
      title: req.body.projectTitle,
      description: req.body.projectDescription,
      email: req.body.projectEmail,
      pid: projectId,
    };
    const updatedProject = await projectModel.updateProject(data);
    const action =
      req.user.role === "USER"
        ? `${req.user.name} updated project information`
        : `${updatedProject.developer} updated project information`;
    await ackLogsModel.createAckLogs({
      userId: Number(req.user.id),
      projectId: Number(projectId),
      agentId: updatedProject.developer,
      action,
    });
    return res
      .status(200)
      .send({ message: "Project Updated", data: updatedProject[1] });
  } catch (error) {
    logger.error(
      `[projectController][updateProjectInfo] Error in Updating Project Info : ${JSON.stringify(
        error
      )} `
    );
    return res.status(500).send({ message: error.message });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const projectId = req.body.projectId;
    const project = await projectModel.getProjectById(projectId);
    if (!project) {
      return res.status(404).send({ message: "Project Not Found" });
    }
    if (req.user.role !== "DEVELOPER") {
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
    const data = {
      status: req.body.status,
    };
    const action = `Project status updated from ${project.status} to ${req.body.status}`;
    const updatedProject = await projectModel.updateProject(data);
    await ackLogsModel.createAckLogs({
      userId: Number(req.user.id),
      projectId: Number(projectId),
      agentId: updatedProject.developer,
      action,
    });
    if (req.body.status === "COMPLETED") {
      await assignmentService.releaseDevFromProject(project.developer);
    }
    return res.status(200).send({
      message: "Project Status Updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    logger.error(
      `[projectController][updateProjectStatus] Error in updating project state : ${JSON.stringify(
        error
      )} `
    );
    return res.status(500).send({ message: error.message });
  }
};

const getProjectSettings = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const projectOwner = await projectService.doesUserOwnsProject(
      projectId,
      Number(req.user.id),
      req.user.role
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
    const settings = await settingsModel.get(projectId);
    return res
      .status(200)
      .send({ message: "Settings Fetched Successfully", data: settings });
  } catch (error) {
    logger.error(
      `[projectController][updateProjectInfo] Error in Updating Project Info : ${JSON.stringify(
        error
      )} `
    );
    return res.status(500).send({ message: error.message });
  }
};

const getAvailableAgents = async (req, res) => {
  try {
    const algorithm = req.params.algorithm;
    const agents = await assignmentService.fetchAvailableAgent(algorithm);
    return res.status(200).send({ message: "Available Agents", data: agents });
  } catch (error) {
    logger.error(
      `[projectController][getAvailableAgents] Error in fetching available agents : ${JSON.stringify(
        error
      )} `
    );
    return res.status(500).send({ message: error.message });
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
  getThreadDataByProject,
  updateProjectInfo,
  updateProjectDataset,
  getProjectSettings,
  getProjectByDevAndStatus,
  getAvailableAgents,
  updateProjectStatus,
};
