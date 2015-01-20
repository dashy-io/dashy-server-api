var MongoClient = require('mongodb').MongoClient;
var config = require('../config');
var inMemoryDataStore = require('./inMemoryDataStore');
var mongoDataStore = require('./mongoDataStore');

module.exports = {
  create : function create(cb) {
    if (config.env === 'test') {
      return cb(null, inMemoryDataStore);
    } else {
      MongoClient.connect(config.mongoDbUrl, function(err, db) {
        if (err) { return cb(err) }
        console.log("New connection to MongoDB server");
        return cb(null, mongoDataStore(db));
      });
    }
  }
};
