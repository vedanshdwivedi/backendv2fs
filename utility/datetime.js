const getCurrentTimeStamp = () => {
  const timezone = process.env.timezone || "UTC";
  return new Date().toLocaleString("en-US", { timeZone: timezone });
};

module.exports = {
  getCurrentTimeStamp,
};
