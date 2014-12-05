'use strict';

var Parse = require('parse').Parse;
var config = require('../config');

Parse.initialize(config.parseAppId, null, config.parseMasterKey);

var Dashboard = Parse.Object.extend('Dashboard');

function _get(id, cb) {
  if (!id) {
    return cb(new Error('DataStore error: ID not specified'));
  }
  var query = new Parse.Query(Dashboard);
  query.equalTo('dashboardId', id);
  query.find({
    useMasterKey: true,
    success: function (parseDashboards) {
      if (parseDashboards.length == 0) {
        return cb(null, null);
      }
      if (parseDashboards.length > 1) {
        return cb(new Error('DataStore error: Too many results'));
      }
      return cb(null, parseDashboards[0]);
    },
    error: function (err) {
      var dataStoreError = new Error('Unknown DataStore error');
      dataStoreError.internalError = err;
      return cb(dataStoreError);
    }
  });
}

function getDashboard(id, cb) {
  _get(id, function(err, parseDashboard) {
    if (err) { return cb(err); }
    if (!parseDashboard) {
      return cb(null, null);
    }
    return cb(null, toPlainObject(parseDashboard, 'dashboardId'));
  });
}

function createDashboard(dashboard, cb) {
  var parseDashboard = new Dashboard();
  parseDashboard.save({
    dashboardId: dashboard.id,
    code: dashboard.code,
    interval: dashboard.interval,
    name: dashboard.name,
    urls: dashboard.urls
  }, {
    useMasterKey: true,
    success: function (parseDashboard) {
      return cb(null, toPlainObject(parseDashboard, 'dashboardId'));
    },
    error: function (data, err) {
      var dataStoreError = new Error('Unknown DataStore error');
      dataStoreError.internalError = err;
      return cb(dataStoreError);
    }
  });
}

function updateDashboard(id, dashboard, cb) {
  _get(id, function(err, parseDashboard) {
    if (err) { return cb(err); }
    if (!parseDashboard) {
      return cb(null, null);
    }
    parseDashboard.save({
      interval: dashboard.interval,
      name: dashboard.name,
      urls: dashboard.urls
    }, {
      useMasterKey: true,
      success: function (parseDashboard) {
        return cb(null, toPlainObject(parseDashboard, 'dashboardId'));
      },
      error: function (data, err) {
        var dataStoreError = new Error('Unknown DataStore error');
        dataStoreError.internalError = err;
        return cb(dataStoreError);
      }
    });
  });
}

function deleteDashboard(id, cb) {
  _get(id, function(err, parseDashboard) {
    if (err) { return cb(err); }
    if (!parseDashboard) {
      return cb(null, false);
    }
    parseDashboard.destroy({
      useMasterKey: true,
      success: function (parseDashboard) {
        return cb(null, true);
      },
      error: function (data, err) {
        var dataStoreError = new Error('Unknown DataStore error');
        dataStoreError.internalError = err;
        return cb(dataStoreError);
      }
    });
  });
}

function toPlainObject(parseObject, idAlias) {
  var plainObject = {};
  for (var attributeName in parseObject.attributes) {
    if (parseObject.attributes.hasOwnProperty(attributeName)) {
      if (attributeName === 'ACL') {
        continue;
      }
      if (attributeName === idAlias) {
        plainObject['id'] = parseObject.get(attributeName);
      } else {
        plainObject[attributeName] = parseObject.get(attributeName);
      }
    }
  }
  return plainObject;
}

module.exports = {
  getDashboard: getDashboard,
  createDashboard: createDashboard,
  updateDashboard: updateDashboard,
  deleteDashboard: deleteDashboard
};
