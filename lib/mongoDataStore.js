'use strict';
let log = require('debug')('app');
let MongoClient = require('mongodb').MongoClient;
let config = require('../config');
let cachedDb = null;

function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

function requireDb(cb) {
  if (cachedDb) {
    return cb(null, cachedDb);
  }
  log('Connecting to MongoDB...', config.mongoDbUrl);
  MongoClient.connect(config.mongoDbUrl, function(err, newDb) {
    if (err) { return cb(err); }
    cachedDb = newDb;
    log('Connected to MongoDB');
    return cb(null, cachedDb);
  });
}

module.exports = {
  name: 'MongoDataStore',
  get: (selector, cb) => {
    // TODO: Return an error if selector / filter not provided
    let collection = Object.keys(selector)[0];
    let filter = selector[collection];
    requireDb((err, db) => {
      if (err) { return cb(err); }
      db.collection(collection).findOne(filter, (err, dashboard) => {
        if (err) { return cb(err); }
        if (dashboard) { delete dashboard._id; }
        return cb(null, dashboard);
      });
    });
  },
  insert: (selector, entity, cb) => {
    // TODO: Return an error if selector not provided
    let collection = Object.keys(selector)[0];
    entity = clone(entity);
    requireDb(function (err, db) {
      if (err) { return cb(err); }
      db.collection(collection).insert(entity, (err, res) => {
        // TODO: Check res
        if (err) { return cb(err); }
        if (entity) {
          delete entity._id;
        }
        return cb(null, entity);
      });
    });
  },
  update: (selector, entity, cb) => {
    // TODO: Return an error if selector / filter not provided
    let collection = Object.keys(selector)[0];
    let filter = selector[collection];
    entity = clone(entity);
    requireDb((err, db) => {
      if (err) { return cb(err); }
      db.collection(collection).update(filter, {$set: entity}, (err, res) => {
        if (err) { return cb(err); }
        if (res === 1) {
          delete entity._id;
          return cb(null, entity);
        } else {
          return cb(null, null);
        }
      });
    });
  },
  delete: (selector, cb) => {
    let collection = Object.keys(selector)[0];
    let filter = selector[collection];
    // TODO: Return an error if selector / filter not provided
    requireDb((err, db) => {
      if (err) { return cb(err); }
      db.collection(collection).remove(filter, (err, res) => {
        if (err) { return cb(err); }
        return cb(null, res === 1);
      });
    });
  }
};
