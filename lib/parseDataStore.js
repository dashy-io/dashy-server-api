'use strict';
var Parse = require('parse').Parse;
var cache = require('memory-cache');

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

function _getDashboardPointer(id, cb) {
  var parseId = cache.get(id);
  var dashboardPointer = new Dashboard();
  if (parseId) {
    dashboardPointer.id = parseId;
    return cb(null, dashboardPointer);
  } else {
    _get(id, function(err, parseDashboard) {
      if (err) { return cb(err); }
      if (!parseDashboard) {
        return cb(null, null);
      }
      cache.put(id, parseDashboard.id);
      dashboardPointer.id = parseDashboard.id;
      return cb(null, dashboardPointer);
    });
  }
}

function getDashboard(id, cb) {
  _get(id, function(err, parseDashboard) {
    if (err) { return cb(err); }
    if (!parseDashboard) {
      return cb(null, null);
    }
    return cb(null, _toPlainObject(parseDashboard, 'dashboardId'));
  });
}

function createDashboard(dashboard, cb) {
  var parseDashboard = new Dashboard();
  _setToParseObject(dashboard, 'dashboardId', parseDashboard);
  parseDashboard.save(null, {
    useMasterKey: true,
    success: function (parseDashboard) {
      return cb(null, _toPlainObject(parseDashboard, 'dashboardId'));
    },
    error: function (data, err) {
      var dataStoreError = new Error('Unknown DataStore error');
      dataStoreError.internalError = err;
      return cb(dataStoreError);
    }
  });
}

function updateDashboard(id, dashboard, cb) {
  _getDashboardPointer(id, function(err, dashboardPointer) {
    if (err) { return cb(err); }
    if (!dashboardPointer) {
      return cb(null, null);
    }
    _setToParseObject(dashboard, 'dashboardId', dashboardPointer);
    dashboardPointer.save(null, {
      useMasterKey: true,
      success: function (parseDashboard) {
        var updatedDashboard = _toPlainObject(parseDashboard, 'dashboardId');
        updatedDashboard.id = id;
        return cb(null, updatedDashboard);
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
  _getDashboardPointer(id, function(err, dashboardPointer) {
    if (err) { return cb(err); }
    if (!dashboardPointer) {
      return cb(null, false);
    }
    dashboardPointer.destroy({
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

function _toPlainObject(parseObject, idAlias) {
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

function _setToParseObject(dashboard, idAlias, parseObject) {
  for(var property in dashboard) {
    if (dashboard.hasOwnProperty(property)) {
      if (property === 'id') {
        parseObject.set(idAlias, dashboard[property]);
      } else {
        parseObject.set(property, dashboard[property]);
      }
    }
  }
}

module.exports = {
  name : 'ParseDataStore',
  getDashboard : getDashboard,
  createDashboard : createDashboard,
  updateDashboard : updateDashboard,
  deleteDashboard : deleteDashboard
};
