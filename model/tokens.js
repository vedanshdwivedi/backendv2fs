const { Tokens } = require("../schema/tokens");
const { encrypt, decrypt } = require("../utility/encoder");

async function createTokenEntry({ userId, token }) {
  const encryptedToken = encrypt(token);
  await Tokens.create({
    userId,
    token: encryptedToken,
  });
}

async function getTokenEntry({ userId }) {
  const userToken = await Tokens.findOne({ userId });
  userToken.token = decrypt(userToken.token);
  return userToken;
}

module.exports = {
  createTokenEntry,
  getTokenEntry,
};
