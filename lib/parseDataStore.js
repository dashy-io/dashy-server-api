'use strict';

var Parse = require('parse').Parse;
var config = require('../config');

Parse.initialize(config.parseAppId, null, config.parseMasterKey);

var Dashboard = Parse.Object.extend('Dashboard');

function _get(id, cb) {
  if (!id) {
    cb(new Error('DataStore error: ID not specified'));
    return;
  }
  var query = new Parse.Query(Dashboard);
  query.equalTo('dashboardId', id);
  query.find({
    useMasterKey: true,
    success: function (parseDashboards) {
      if (parseDashboards.length == 0) {
        cb(null, null);
        return;
      }
      if (parseDashboards.length > 1) {
        cb(new Error('DataStore error: Too many results'));
        return;
      }
      cb(null, parseDashboards[0]);
      return;
    },
    error: function (err) {
      var dataStoreError = new Error('Unknown DataStore error');
      dataStoreError.internalError = err;
      cb(dataStoreError);
      return;
    }
  });
}

function getDashboard(id, cb) {
  _get(id, function(err, parseDashboard) {
    if (err) {
      cb(err);
      return;
    }
    if (!parseDashboard) {
      cb(null, null);
      return;
    }
    cb(null, toPlainObject(parseDashboard, 'dashboardId'));
    return;
  });
}

function createDashboard(dashboard, cb) {
  _get(dashboard.id, function(err, res) {
    if (err) {
      cb(err);
      return;
    }
    if (res) {
      var dataStoreError = new Error('DataStore error: A dashboard with the same ID exists');
      dataStoreError.internalError = err;
      cb(dataStoreError);
      return;
    }
    var parseDashboard = new Dashboard();
    parseDashboard.save({
      dashboardId: dashboard.id,
      interval: dashboard.interval,
      name: dashboard.name,
      urls: dashboard.urls
    }, {
      useMasterKey: true,
      success: function (parseDashboard) {
        cb(null, toPlainObject(parseDashboard, 'dashboardId'));
        return;
      },
      error: function (data, err) {
        var dataStoreError = new Error('Unknown DataStore error');
        dataStoreError.internalError = err;
        cb(dataStoreError);
        return;
      }
    });
  });
}

function updateDashboard(id, dashboard, cb) {
  _get(id, function(err, parseDashboard) {
    if (err) {
      cb(err);
      return;
    }
    if (!parseDashboard) {
      cb(null, null);
      return;
    }
    parseDashboard.save({
      interval: dashboard.interval,
      name: dashboard.name,
      urls: dashboard.urls
    }, {
      useMasterKey: true,
      success: function (parseDashboard) {
        cb(null, toPlainObject(parseDashboard, 'dashboardId'));
        return;
      },
      error: function (data, err) {
        var dataStoreError = new Error('Unknown DataStore error');
        dataStoreError.internalError = err;
        cb(dataStoreError);
        return;
      }
    });
  });
}

function deleteDashboard(id, cb) {
  _get(id, function(err, parseDashboard) {
    if (err) {
      cb(err);
      return;
    }
    if (!parseDashboard) {
      cb(null, false);
      return;
    }
    parseDashboard.destroy({
      useMasterKey: true,
      success: function (parseDashboard) {
        cb(null, true);
        return;
      },
      error: function (data, err) {
        var dataStoreError = new Error('Unknown DataStore error');
        dataStoreError.internalError = err;
        cb(dataStoreError);
        return;
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
