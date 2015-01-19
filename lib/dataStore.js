var config = require('../config');
var inMemoryDataStore = require('./inMemoryDataStore');
var parseDataStore = require('./parseDataStore');
var mongoDataStore = require('./mongoDataStore');

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
