const { logger } = require("../logger");
const commentModel = require("../model/Comments");
const projectService = require("../service/project");
const { trackMixPanelEvent } = require("../segment");

const create = async (req, res) => {
  try {
    console.log({ ...req.body });
    const error = commentModel.validateData({
      ...req.body,
      role: req.user.role,
      uid: req.user.id,
    });
    const projectId = req.body.pid;
    const projectOwner = await projectService.doesUserOwnsProject(
      projectId,
      req.user.id
    );
    if (!projectOwner) {
      logger.info(
        `[commentController][create] User Does Not have access to this project `
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
    if (error) {
      logger.error(
        `[commentController][create] Validation Failed : ${error.details[0].message} `
      );
      return res.status(401).send({ message: error.details[0].message });
    }
    const comment = await commentModel.create({
      ...req.body,
      role: req.user.role,
      uid: req.user.id,
    });
    return res.status(201).send({ message: "Comment Created", data: comment });
  } catch (error) {
    logger.error(
      `[commentController][create] Failed to create Comment : ${JSON.stringify(
        error
      )} `
    );
    return res.status(500).send({ message: error.message });
  }
};

const get = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const projectOwner = await projectService.doesUserOwnsProject(
      projectId,
      req.user.id
    );
    if (!projectOwner) {
      logger.info(
        `[commentController][get] User Does Not have access to this project `
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
    const comments = await commentModel.get(projectId);
    if (!comments || comments.length === 0) {
      return res.status(200).send({ message: "Comments Not Found", data: [] });
    }
    return res
      .status(200)
      .send({ message: "Comments Fetched", data: comments });
  } catch (error) {
    logger.error(
      `[commentController][get] Error in Fetching Comments : ${JSON.stringify(
        error
      )}`
    );
    return res.status(500).send({ message: error.message });
  }
};

module.exports = {
  create,
  get,
};
