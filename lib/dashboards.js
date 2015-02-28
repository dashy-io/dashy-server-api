'use strict';
var DataStore = require('../lib/mongoDataStore');

module.exports = {
  add : function (dashboard, cb) {
    DataStore.insert({ dashboards : null }, dashboard, function(err, dashboard) {
      if (err) { return cb(err); }
      cb(null, dashboard);
    });
  },
  get : function (id, cb) {
    DataStore.get({ dashboards : { id : id }}, function(err, dashboard) {
      if (err) { return cb(err); }
      cb(null, dashboard);
    });
  },
  getByCode : function (code, cb) {
    DataStore.get({ dashboards : { code : code }}, function(err, dashboard) {
      if (err) { return cb(err); }
      cb(null, dashboard);
    });
  },
  update : function (dashboard, cb) {
    DataStore.update({ dashboards : { id : dashboard.id }}, dashboard, function(err, dashboard) {
      if (err) { return cb(err); }
      cb(null, dashboard);
    });
  },
  remove : function (id, cb) {
    DataStore.delete({ dashboards : { id : id }}, function(err, removed) {
      if (err) { return cb(err); }
      cb(null, removed);
    });
  },
  removeCode : function (id, cb) {
    DataStore.update({ dashboards : { id : id }}, { code : null }, function(err, dashboard) {
      if (err) { return cb(err); }
      cb(null, dashboard);
    });
  }
};
