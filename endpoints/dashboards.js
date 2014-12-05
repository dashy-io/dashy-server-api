'use strict';
var express = require('express');
var randToken = require('rand-token');

var dataStore = require('../lib/parseDataStore');
var router = express.Router();
var app = express();

router.post('/dashboards', function (req, res, next) {
  if (!req.body.id) {
    var badRequestError = new Error('Parameter "id" missing in body');
    badRequestError.status = 400;
    return next(badRequestError);
  }
  var newDashboard = {
    id : req.body.id,
    code : randToken.generate(8)
  };

  dataStore.getDashboard(newDashboard.id, function(err, dashboard) {
    if (err) { return next(err); }
    if (dashboard) {
      var conflictError = new Error('Duplicate Dashboard ID');
      conflictError.status = 409;
      return next(conflictError);
    }
    dataStore.createDashboard(newDashboard, function(err, createdDashboard) {
      if (err) { return next(err); }
      res.status(201);
      res.json(createdDashboard);
    });
  });
});

router.get('/dashboards/:id', function(req, res, next) {
  var id = req.params.id;
  dataStore.getDashboard(id, function(err, dashboard) {
    if (err) { return next(err); }
    if (!dashboard) {
      var notFoundError = new Error('Dashboard Not Found');
      notFoundError.status = 404;
      return next(notFoundError);
    }
    res.status(200);
    res.json(dashboard);
  });
});

router.put('/dashboards/:id', function(req, res, next) {
  var id = req.params.id;
  var dashboard = req.body;
  var bodyId = dashboard.id;
  var bodyCode = dashboard.code;
  if (bodyId && bodyId !== id) {
    var idConflictError = new Error('Dashboard ID in request body does not match ID in url');
    idConflictError.status = 409;
    return next(idConflictError);
  }
  dataStore.getDashboard(id, function(err, currentDashboard) {
    if (err) { return next(err); }
    if (!currentDashboard) {
      var notFoundError = new Error('Dashboard not found');
      notFoundError.status = 404;
      return next(notFoundError);
    }
    if (bodyCode && bodyCode !== currentDashboard.code) {
      var codeConflictError = new Error('Dashboard\'s code cannot be changed');
      codeConflictError.status = 409;
      return next(codeConflictError);
    }
    dataStore.updateDashboard(id, dashboard, function(err, updatedDashboard) {
      if (err) { return next(err); }
      res.status(200);
      res.json(updatedDashboard);
    });
  });
});

router.delete('/dashboards/:id', function(req, res, next) {
  var id = req.params.id;
  dataStore.deleteDashboard(id, function(err, deleted) {
    if (err) { return next(err); }
    if (!deleted) {
      var notFoundError = new Error('Dashboard not found');
      notFoundError.status = 404;
      return next(notFoundError);
    }
    res.status(204);
    res.end();
  });
});

module.exports = router;
