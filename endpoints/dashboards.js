'use strict';
var express = require('express');
var dataStore = require('../lib/parseDataStore');
var uuid = require('node-uuid');
var randToken = require('rand-token');

var router = express.Router();
var app = express();

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
  if (req.body.id) {
    var conflictError = new Error('Parameter "id" MUST NOT be set in body');
    conflictError.status = 400;
    next(conflictError);
    return;
  }
  if (req.body.code) {
    var conflictError = new Error('Parameter "code" MUST NOT be set in body');
    conflictError.status = 400;
    next(conflictError);
    return;
  }
  var id = req.params.id;
  dataStore.updateDashboard(id, req.body, function(err, dashboard) {
    if (err) {
      next(err);
      return;
    }
    if (!dashboard) {
      var conflictError = new Error('Dashboard Not Found');
      conflictError.status = 404;
      next(conflictError);
      return;
    }
    res.status(200);
    res.json(dashboard);
  });
});

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

router.delete('/dashboards/:id', function(req, res, next) {
  var id = req.params.id;
  dataStore.deleteDashboard(id, function(err, deleted) {
    if (err) {
      next(err);
      return;
    }
    if (!deleted) {
      var notFoundError = new Error('Dashboard Not Found');
      notFoundError.status = 404;
      next(notFoundError);
      return;
    }
    res.status(204);
    res.end();
  });
});

router.get('/dashboards/:id/code', function (req, res, next) {
  var id = req.params.id;
  var code = randToken.generate(8);
  res.status(200);
  res.json({
    id : id,
    code: code
  });
});

module.exports = router;
