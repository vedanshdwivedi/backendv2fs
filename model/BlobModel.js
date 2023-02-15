const { func, options } = require("joi");
const { blobService } = require("../database/azureBlob");
const { logger } = require("../logger");

const handleContainerCreation = async (containerName) => {
  const containerClient = blobService.getContainerClient(containerName);
  const createContainerResponse = await containerClient.create({
    access: "blob",
  });
  logger.info(
    `[BlobModel][handleContainerCreation] Container Created : ${JSON.stringify(
      createContainerResponse
    )} `
  );
  return containerClient;
};

module.exports = {
  handleContainerCreation,
};
