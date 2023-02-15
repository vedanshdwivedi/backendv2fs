var azure = require("azure-storage");
const AzureStorageBlob = require("@azure/storage-blob");

// Enter your storage account name and shared key
const account = process.env.AZURE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_ACCOUNT_KEY;
// const blobService = azure.createBlobService(account, accountKey);
const sharedKeyCredential = new AzureStorageBlob.StorageSharedKeyCredential(
  account,
  accountKey
);
const blobService = new AzureStorageBlob.BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

module.exports = {
  blobService,
};
