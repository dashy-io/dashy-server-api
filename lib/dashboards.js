'use strict';
var DataStore = require('../lib/dataStore');

module.exports = {
  add : function (dashboard, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.insert({ dashboards : null }, dashboard, function(err, dashboard) {
        if (err) { return cb(err); }
        cb(null, dashboard);
      });
    });
  },
  get : function (id, cb) {
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
  },
  update : function (dashboard, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.update({ dashboards : { id : dashboard.id }}, dashboard, function(err, dashboard) {
        if (err) { return cb(err); }
        cb(null, dashboard);
      });
    });
  },
  remove : function (id, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.delete({ dashboards : { id : id }}, function(err, removed) {
        if (err) { return cb(err); }
        cb(null, removed);
      });
    });
  },
  removeCode : function (id, cb) {
    DataStore.create(function (err, dataStore) {
      if (err) { return cb(err); }
      dataStore.update({ dashboards : { id : id }}, { code : null }, function(err, dashboard) {
        if (err) { return cb(err); }
        cb(null, dashboard);
      });
    });
  }
};
