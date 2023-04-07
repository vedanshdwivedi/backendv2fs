const { logger } = require("../logger");

validStates = [
  "CREATED",
  "ON_HOLD",
  "ACCEPTED",
  "REJECTED",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
];

const stateMap = {
  CREATED: ["ON_HOLD", "ACCEPTED", "REJECTED"],
  ON_HOLD: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["IN_PROGRESS"],
  REJECTED: [],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  FAILED: [],
};

const getNextStates = (currentState) => {
  if (!validStates.includes(currentState)) {
    throw new Error("Invalid State");
  }
  return stateMap[currentState];
};

module.exports = {
  getNextStates,
};
