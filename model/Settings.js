const { Settings } = require("../schema/settings");

const init = async (projectId, algorithm) => {
  return await new Settings({
    projectId,
    algorithm,
  }).save();
};

const update = async () => {};

const get = async (projectId) => {
  return await Settings.findOne({ pid: projectId });
};

module.exports = {
  init,
  init,
  get,
};
