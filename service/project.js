const { createProjectEntry } = require("../model/Project");

const createProjectService = async ({
  uid,
  title,
  description,
  createdAt,
  email,
  algorithm,
  container,
}) => {
  const project = await createProjectEntry({
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

module.exports = {
  createProjectService,
};
