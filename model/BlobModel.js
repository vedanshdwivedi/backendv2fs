const { blobService } = require("../database/azureBlob");
const { logger } = require("../logger");

const getContainerClient = (containerName) => {
  const containerClient = blobService.getContainerClient(containerName);
  return containerClient;
};

const handleContainerCreation = async (containerName) => {
  const containerClient = getContainerClient(containerName);
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

const deleteFileFromBlob = async (containerName, blobName) => {
  const containerClient = await getContainerClient(containerName);
  const blobClient = await containerClient.getBlobClient(blobName);
  await blobClient.deleteIfExists();
};

module.exports = {
  handleContainerCreation,
  getContainerClient,
  deleteFileFromBlob,
};
