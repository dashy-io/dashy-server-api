'use strict';
var DataStore = require('../lib/mongoDataStore');

module.exports = {
  add : function (user, cb) {
    DataStore.insert({ users : null }, user, function(err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  },
  get : function (id, cb) {
    DataStore.get({ users : { id : id }}, function(err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  },
  getByGoogleId : function (googleId, cb) {
    DataStore.get({ users : { 'profiles.google.id' : googleId }}, function(err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  },
  update : function (user, cb) {
    DataStore.update({ users : { id : user.id }}, user, function(err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  },
  remove : function (id, cb) {
    DataStore.delete({ users : { id : id }}, function(err, removed) {
      if (err) { return cb(err); }
      cb(null, removed);
    });
  }
};
