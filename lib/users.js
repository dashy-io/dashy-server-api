'use strict';
var DataStore = require('../lib/dataStore');

module.exports = {
  add : function (user, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.insert({ users : null }, user, function(err, user) {
        if (err) { return cb(err); }
        cb(null, user);
      });
    });
  },
  get : function (id, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.get({ users : { id : id }}, function(err, user) {
        if (err) { return cb(err); }
        cb(null, user);
      });
    });
  },
  getByGoogleId : function (googleId, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.get({ users : { 'profiles.google.id' : googleId }}, function(err, user) {
        if (err) { return cb(err); }
        cb(null, user);
      });
    });
  },
  update : function (user, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.update({ users : { id : user.id }}, user, function(err, user) {
        if (err) { return cb(err); }
        cb(null, user);
      });
    });
  },
  remove : function (id, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.delete({ users : { id : id }}, function(err, removed) {
        if (err) { return cb(err); }
        cb(null, removed);
      });
    });
  }
};
