const taskModel = require("../model/task");
const { trackMixPanelEvent } = require("../segment");
const { logger } = require("../logger");
const axios = require("axios");

const triggerCeleryTask = async (
  projectId,
  userId,
  status,
  type,
  url,
  payload
) => {
  try {
    const data = {
      pid: projectId,
      uid: userId,
      status: status,
      type: type,
      url: url,
      payload: JSON.stringify(payload),
    };
    logger.info(
      `[UTILITIES][CELERY] Triggering Celery Task : ${JSON.stringify(payload)}`
    );
    const createdTask = await taskModel.create(data);
    payload["taskId"] = createdTask.taskId;
    const config = {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    };
    await axios
      .post(url, payload, config)
      .then((response) => {
        trackMixPanelEvent(
          "celery-task-trigger-success",
          { projectId, url, payload },
          `${userId}`
        );
      })
      .catch((err) => {
        logger.error(
          `[UTILITIES][CELERY][triggerCeleryTask] Error in triggering celery task, error -> ${JSON.stringify(
            err
          )}`
        );
      });
  } catch (error) {
    trackMixPanelEvent(
      "celery-task-trigger-failure",
      { projectId, url, payload },
      `${userId}`
    );
    logger.error(
      `[UTILITIES][CELERY][triggerCeleryTask] Error : ${JSON.stringify(error)}`
    );
    throw error;
  }
};

module.exports = {
  triggerCeleryTask,
};
