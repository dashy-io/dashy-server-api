var MongoClient = require('mongodb').MongoClient;
var config = require('../config');
var mongoDataStore = require('./mongoDataStore');

var db = null;

module.exports = {
  create : function create(cb) {
    if (db) {
      return cb(null, mongoDataStore(db));
    }
    MongoClient.connect(config.mongoDbUrl, function(err, newDb) {
      if (err) { return cb(err) }
      db = newDb;
      console.log("New connection to MongoDB server");
      return cb(null, mongoDataStore(db));
    });
  }
};
