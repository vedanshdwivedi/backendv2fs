const crypto = require("crypto");

const encodeObjectToUniqueString = (data) => {
  const randomChar = Math.random().toString(36).substring(2, 3).toLowerCase();
  const stringified = JSON.stringify(data);
  const hash = crypto.createHash("sha256").update(stringified).digest();
  const base64hash = Buffer.from(hash).toString("base64");
  const encoded = base64hash
    .replace(/[^a-z0-9]/g, randomChar)
    .substring(0, 60)
    .toLowerCase();
  return encoded;
};

module.exports = {
  encodeObjectToUniqueString,
};
