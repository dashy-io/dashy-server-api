'use strict';
var DataStore = require('../lib/dataStore');

module.exports = {
  getById : function (id, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.get({ users : { id : id }}, function(err, user) {
        if (err) { return cb(err); }
        cb(null, user);
      });
    });
  }
};
