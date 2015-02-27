'use strict';
var uuid = require('node-uuid');
var express = require('express');
var validator = require('../lib/validator');
var errorGenerator = require('../lib/errorGenerator');
var tokens = require('../lib/tokens');
var DataStore = require('../lib/dataStore');
var router = express.Router();
var app = express();

function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

router.get('/users/:id?', function (req, res, next) {
  var id = req.params.id;
  if (!id) {
    return next(errorGenerator.missingParameter('id'));
  }
  DataStore.create(function (err, dataStore) {
    if (err) { return next(err); }
    dataStore.getUser(id, function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        return next(errorGenerator.notFound('User'));
      }
      res.status(200);
      res.json(user);
    });
  });
});

// TODO: Test this
router.get('/user', function (req, res, next) {
  var token = tokens.parseHeader(req.headers.authorization);
  if (!token) {
    return next(errorGenerator.unauthorized('Missing or invalid Authorization header'));
  }
  tokens.getUserId(token, function (err, id) {
    if (!id) {
      return next(errorGenerator.unauthorized('Invalid token'));
    }
    DataStore.create(function (err, dataStore) {
      if (err) { return next(err); }
      dataStore.getUser(id, function (err, user) {
        if (err) { return next(err); }
        if (!user) {
          return next(errorGenerator.notFound('User associated with token'));
        }
        res.status(200);
        res.json(user);
      });
    });
  });
});

router.delete('/users/:id?', function (req, res, next) {
  var id = req.params.id;
  if (!id) {
    return next(errorGenerator.missingParameter('id'));
  }
  DataStore.create(function (err, dataStore) {
    if (err) { return next(err); }
    dataStore.deleteUser(id, function (err, deleted) {
      if (err) { return next(err); }
      if (!deleted) {
        return next(errorGenerator.notFound('User'));
      }
      res.status(204);
      res.end();
    });
  });
});

router.post('/users/:id/dashboards', function (req, res, next) {
  var userId = req.params.id;
  var dashboardConnect = clone(req.body);
  var requiredProperties = ['code'];
  var validationError = validator.requireProperties(dashboardConnect, requiredProperties);
  if (validationError) {
    return next(errorGenerator.missingProperty(validationError.missingProperty));
  }
  DataStore.create(function (err, dataStore) {
    if (err) { return next(err); }
    dataStore.getUser(userId, function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        return next(errorGenerator.notFound('User'));
      }
      dataStore.getDashboardByCode(dashboardConnect.code, function(err, dashboard) {
        if (err) { return next(err); }
        if (!dashboard) {
          return next(errorGenerator.notFound('Dashboard'));
        }
        // TODO: This should always be an array
        if (!user.dashboards) {
          user.dashboards = [];
        }
        if (user.dashboards.indexOf(dashboard.id) === -1) {
          user.dashboards.push(dashboard.id);
        }
        dataStore.updateUser(user.id, user, function (err, updatedUser) {
          res.status(201);
          res.json(updatedUser.dashboards);
        });
      });
    });
  });
});

router.delete('/users/:id/dashboards/:dashboardId', function (req, res, next) {
  var userId = req.params.id;
  var dashboardId = req.params.dashboardId;
  // TODO: Throw error if the request has a body
  DataStore.create(function (err, dataStore) {
    if (err) { return next(err); }
    dataStore.getUser(userId, function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        return next(errorGenerator.notFound('User'));
      }
      var index = user.dashboards.indexOf(dashboardId);
      if (index > -1) {
        user.dashboards.splice(index, 1);
      } else {
        return next(errorGenerator.notFound('Connected Dashboard'));
      }
      dataStore.updateUser(user.id, user, function (err, updatedUser) {
        res.status(200);
        res.json(updatedUser.dashboards);
      });
    });
  });
});

module.exports = router;
