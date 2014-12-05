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
    next(badRequestError);
    return;
  }
  var newDashboard = {
    id : req.body.id,
    code : randToken.generate(8)
  };

  dataStore.getDashboard(newDashboard.id, function(err, dashboard) {
    if (err) {
      next(err);
      return;
    }
    if (dashboard) {
      var conflictError = new Error('Duplicate Dashboard ID');
      conflictError.status = 409;
      next(conflictError);
      return;
    }
    dataStore.createDashboard(newDashboard, function(err, createdDashboard) {
      if (err) {
        next(err);
        return;
      }
      res.status(201);
      res.json(createdDashboard);
    });
  });
});

router.get('/dashboards/:id', function(req, res, next) {
  var id = req.params.id;
  dataStore.getDashboard(id, function(err, dashboard) {
    if (err) {
      next(err);
      return;
    }
    if (!dashboard) {
      var notFoundError = new Error('Dashboard Not Found');
      notFoundError.status = 404;
      next(notFoundError);
      return;
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
    next(idConflictError);
    return;
  }
  dataStore.getDashboard(id, function(err, currentDashboard) {
    if (err) {
      next(err);
      return;
    }
    if (!currentDashboard) {
      var notFoundError = new Error('Dashboard not found');
      notFoundError.status = 404;
      next(notFoundError);
      return;
    }
    if (bodyCode && bodyCode !== currentDashboard.code) {
      var codeConflictError = new Error('Dashboard\'s code cannot be changed');
      codeConflictError.status = 409;
      next(codeConflictError);
      return;
    }
    dataStore.updateDashboard(id, dashboard, function(err, updatedDashboard) {
      if (err) {
        next(err);
        return;
      }
      res.status(200);
      res.json(updatedDashboard);
      return;
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
      next(notFoundError);
      return;
    }
    res.status(204);
    res.end();
    return;
  });
});

module.exports = router;
