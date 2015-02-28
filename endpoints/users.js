'use strict';
var express = require('express');
var validator = require('../lib/validator');
var errorGenerator = require('../lib/errorGenerator');
var requireAuthorization = require('../lib/authorizationMiddleware');
var Dashboard = require('../models/dashboard');
var User =require('../models/user');
var router = express.Router();

function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

router.get('/users/:id?', function (req, res, next) {
  var id = req.params.id;
  if (!id) {
    return next(errorGenerator.missingParameter('id'));
  }
  User.get(id, function (err, user) {
    if (err) { return next(err); }
    if (!user) {
      return next(errorGenerator.notFound('User'));
    }
    res.status(200);
    res.json(user);
  });
});

router.get('/user', requireAuthorization, function (req, res, next) {
  res.status(200);
  res.json(req.user);
});

router.delete('/users/:id?', function (req, res, next) {
  var id = req.params.id;
  if (!id) {
    return next(errorGenerator.missingParameter('id'));
  }
  User.remove(id, function (err, removed) {
    if (err) { return next(err); }
    if (!removed) {
      return next(errorGenerator.notFound('User'));
    }
    res.status(204);
    res.end();
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
  User.get(userId, function (err, user) {
    if (err) { return next(err); }
    if (!user) {
      return next(errorGenerator.notFound('User'));
    }
    Dashboard.getByCode(dashboardConnect.code, function(err, dashboard) {
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
      Dashboard.removeCode(dashboard.id, function(err, removed){
        if (err) { return next(err); }
        User.update(user, function (err, updatedUser) {
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
  User.get(userId, function (err, user) {
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
    User.update(user, function (err, updatedUser) {
      res.status(200);
      res.json(updatedUser.dashboards);
    });
  });
});

module.exports = router;
