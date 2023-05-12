const { logger } = require("../logger");
const agentModel = require("./../model/Agent");
const projectModel = require("./../model/Project");
const ackLogModel = require("./../model/ackLogs");
const userModel = require("./../model/User");

const fetchAvailableAgent = async (algorithm) => {
  try {
    const agents = await agentModel.getAvailableAgentsByAlgorithm(algorithm);
    const formattedAgents = agents.map((agent) => ({
      maxConcurrency: Number(agent.maxConcurrency),
      currentConcurrency: Number(agent.currentConcurrency),
      totalProjects: Number(agent.totalProjects),
      availableConcurrency:
        Number(agent.maxConcurrency) - Number(agent.currentConcurrency),
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
      aid: agent.aid,
      uid: agent.uid,
      algorithm: algorithm,
    }));
    return formattedAgents;
  } catch (error) {
    logger.error(
      `[assignmentService][fetchAvailableAgent] Error : ${JSON.stringify(
        error
      )} `
    );
    throw error;
  }
};

const assignAgentToProject = async (project) => {
  try {
    // Fetch Agents
    const availableAgents = await fetchAvailableAgent(project.algorithm);
    if (!availableAgents || availableAgents.length < 1) {
      await ackLogModel.createAckLogs({
        userId: project.uid,
        projectId: project.pid,
        agentId: null,
        action: "No agents available for assignment",
      });
    }
    const assignedAgent = availableAgents[0];
    const agentProfile = await userModel.fetchUserByUid(assignedAgent.uid);
    project.developer = agentProfile.username;
    await projectModel.updateProject(project);
    await agentModel.updateCurrentConcurrency(assignedAgent.uid, 1);
    await ackLogModel.createAckLogs({
      userId: project.uid,
      projectId: project.pid,
      agentId: agentProfile.username,
      action: `DEVELOPER ${JSON.stringify(
        agentProfile.username
      )} assigned to project`,
    });
  } catch (error) {
    logger.error(
      `[assignmentService][assignAgentToProject] Error in assigning agent : ${JSON.stringify(
        error
      )} `
    );
    throw error;
  }
};

const releaseDevFromProject = async (developerUsername) => {
  try {
    const userProfile = await userModel.fetchUserByDeveloper(developerUsername);
    if (!userProfile) {
      return;
    }
    return await agentModel.updateCurrentConcurrency(userProfile.uid, -1);
  } catch (error) {
    logger.error(
      `[assignmentService][releaseDevFromProject] Error : ${JSON.stringify(
        error
      )} `
    );
    throw error;
  }
};

module.exports = {
  fetchAvailableAgent,
  assignAgentToProject,
  releaseDevFromProject,
};
