'use strict';
var DataStore = require('../lib/dataStore');

module.exports = {
  getById : function (id, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.get({ dashboards : { id : id }}, function(err, dashboard) {
        if (err) { return cb(err); }
        cb(null, dashboard);
      });
    });
  },
  getByCode : function (code, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.get({ dashboards : { code : code }}, function(err, dashboard) {
        if (err) { return cb(err); }
        cb(null, dashboard);
      });
    });
  }
};
