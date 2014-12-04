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

router.delete('/dashboards/:id?', function(req, res, next) {
  var ids = [];
  var errorIds = [];
  var deletedCount = 0;
  var error = false;
  if (req.params.id) {
    ids.push(req.params.id)
  }
  if (req.body instanceof Array) {
    ids = ids.concat(req.body);
  }
  ids.forEach(function (id) {
    if (error) { return; }
    dataStore.deleteDashboard(id, function(err, deleted) {
      if (err) {
        error = true;
        next(err);
        return;
      }
      if (!deleted) {
        errorIds.push(id);
      }
      deletedCount++;
      if (deletedCount === ids.length) {
        if (errorIds.length > 0) {
          var notFoundError = new Error('Dashboard(s) not found: ' + ids.join());
          notFoundError.status = 404;
          next(notFoundError);
          return;
        } else {
          res.status(204);
          res.end();
          return;
        }
      }
    });
  });
});

module.exports = router;
