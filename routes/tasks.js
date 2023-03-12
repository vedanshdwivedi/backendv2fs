const { Router } = require("express");
const { validateJWT } = require("../middelware");
const taskController = require("../controller/taskController");

const taskRouter = Router();

taskRouter.get("/:projectId", validateJWT, taskController.getTasksByProjectId);

module.exports = {
  taskRouter,
};
