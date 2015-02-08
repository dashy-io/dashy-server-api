'use strict';

var log = require('debug')('app');
// var logError = require('debug')('app:error');
var MongoClient = require('mongodb').MongoClient;
var config = require('../config');
var mongoDataStore = require('./mongoDataStore');
var db = null;

module.exports = {
  create : function create(cb) {
    if (db) {
      return cb(null, mongoDataStore(db));
    }
    log('Connecting to MongoDB...', config.mongoDbUrl);
    MongoClient.connect(config.mongoDbUrl, function(err, newDb) {
      if (err) { return cb(err); }
      db = newDb;
      log('Connected to MongoDB');
      return cb(null, mongoDataStore(db));
    });
  }
};
