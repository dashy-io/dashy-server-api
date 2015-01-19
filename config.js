'use strict';
var express = require('express');
var app = express();

function checkAndLoadEnvironment(name) {
  if (!process.env[name]) {
    throw new Error(name + ' environment variable not set!')
  }
  return process.env[name];
}

function getEnv() {
  return app.get('env');
}

module.exports = {
  port : process.env.PORT || 3001,
  env : getEnv(),
  parseAppId : checkAndLoadEnvironment('DASHY_PARSE_APP_ID'),
  parseMasterKey : checkAndLoadEnvironment('DASHY_PARSE_MASTER_KEY'),
  googleClientId : '955388086787-1llsm4tuo5tbn050f0huu37kc17j6rru.apps.googleusercontent.com',
  mongoDbUrl: checkAndLoadEnvironment('MONGOLAB_URI')
};
