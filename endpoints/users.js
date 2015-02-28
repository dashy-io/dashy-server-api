'use strict';
var express = require('express');
var validator = require('../lib/validator');
var errorGenerator = require('../lib/errorGenerator');
var requireAuthorization = require('../lib/authorizationMiddleware');
var DataStore = require('../lib/dataStore');
var dashboards = require('../lib/dashboards');
var users = require('../lib/users');
var router = express.Router();

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
    users.get(id, function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        return next(errorGenerator.notFound('User'));
      }
      res.status(200);
      res.json(user);
    });
  });
});

router.get('/user', requireAuthorization, function (req, res, next) {
  DataStore.create(function (err, dataStore) {
    if (err) { return next(err); }
    users.get(req.user, function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        return next(errorGenerator.notFound('User associated with token'));
      }
      res.status(200);
      res.json(user);
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
    dataStore.delete({ users : { id : id }}, function (err, deleted) {
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
    users.get(userId, function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        return next(errorGenerator.notFound('User'));
      }
      dashboards.getByCode(dashboardConnect.code, function(err, dashboard) {
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
        dataStore.update({ dashboards : { id : dashboard.id }}, { code: null }, function(err, updatedDashboard){
          if (err) { return next(err); }
          users.update(user, function (err, updatedUser) {
            res.status(201);
            res.json(updatedUser.dashboards);
          });
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
    users.get(userId, function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        return next(errorGenerator.notFound('User'));
      }
      // TODO: This should always be an array
      if (!user.dashboards) {
        user.dashboards = [];
      }
      var index = user.dashboards.indexOf(dashboardId);
      if (index > -1) {
        user.dashboards.splice(index, 1);
      } else {
        return next(errorGenerator.notFound('Connected Dashboard'));
      }
      users.update(user, function (err, updatedUser) {
        res.status(200);
        res.json(updatedUser.dashboards);
      });
    });
  });
});

module.exports = router;
