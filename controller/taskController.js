const taskModel = require("../model/task");
const fileModel = require("../model/File");
const projectService = require("../service/project");

const getTasksByProjectId = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const isOwner = await projectService.doesUserOwnsProject(
      projectId,
      Number(req.user.id)
    );
    if (!isOwner) {
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
    const files = await fileModel.getAllFilesByProjectId(projectId);
    let fileMap = {};
    files.forEach((obj) => {
      if (obj.parentFileId !== null) {
        fileMap[obj.parentFileId] = obj.downloadLink;
      }
    });
    const tasks = await taskModel.getByProjectId(projectId);
    let newTaskStructure = [];
    tasks.forEach((obj) => {
      obj.payload = JSON.parse(obj.payload);
      let downloadLink = null;
      if (obj.payload.datasetId !== null) {
        downloadLink = fileMap[obj.payload.datasetId];
      }
      newTaskStructure.push({ ...obj.dataValues, downloadLink: downloadLink });
    });
    return res
      .status(200)
      .send({ message: "Fetched Tasks Successfully", data: newTaskStructure });
  } catch (error) {
    logger.error(
      `[taskController][getTasksByProjectId] Error in Fetching Tasks : ${JSON.stringify(
        error
      )} `
    );
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  getTasksByProjectId,
};
