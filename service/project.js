const projectModel = require("../model/Project");

const createProjectService = async ({
  uid,
  title,
  description,
  createdAt,
  email,
  algorithm,
  container,
}) => {
  const project = await projectModel.createProjectEntry({
    uid,
    title,
    description,
    status: "INITIALIZED",
    email,
    algorithm,
    container,
    expert: "vedanshdwivedigmail",
  });
  return project;
};

const doesUserOwnsProject = async (projectId, userId, role = "USER") => {
  if (role === "DEVELOPER") {
    return true;
  }
  const project = await projectModel.getProjectById(projectId);
  if (!project) {
    throw new Error("Project Not Found");
  }
  return Number(project.uid) === Number(userId);
};

module.exports = {
  createProjectService,
  doesUserOwnsProject,
};
