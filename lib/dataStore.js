var config = require('../config');
var inMemoryDataStore = require('./inMemoryDataStore');
var parseDataStore = require('./parseDataStore');

function getDataStore() {
  if (config.env === 'test') {
    return inMemoryDataStore;
  } else {
    return parseDataStore;
  }
}

module.exports = {
  getDataStore : getDataStore
};
