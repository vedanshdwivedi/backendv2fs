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

const encrypt = (data) => {
  let buff = new Buffer(data);
  let base64data = buff.toString("base64");
  return base64data;
};

const decrypt = (data) => {
  let buff = new Buffer(data, "base64");
  let text = buff.toString("utf-8");
  return text;
};

module.exports = {
  encodeObjectToUniqueString,
  encrypt,
  decrypt,
};
