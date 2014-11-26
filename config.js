function checkAndLoadEnvironment(name) {
  if (!process.env[name]) {
    throw new Error(name + ' environment variable not set!')
  }
  return process.env[name];
}

module.exports = {
  port : process.env.PORT || 3001,
  parseAppId : checkAndLoadEnvironment('DASHY_PARSE_APP_ID'),
  parseMasterKey : checkAndLoadEnvironment('DASHY_PARSE_MASTER_KEY')
};
