const { Router } = require("express");
const { validateJWT } = require("../middelware");
const projectController = require("../controller/projectController");

const projectRouter = Router();

projectRouter.post("/", validateJWT, projectController.createProject);
projectRouter.get("/files", validateJWT, projectController.getAllFiles);
projectRouter.get("/", validateJWT, projectController.getProjectsByUserId);

module.exports = {
  projectRouter,
};