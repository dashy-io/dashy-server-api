'use strict';
var express = require('express');
var randToken = require('rand-token');

var dataStore = require('../lib/dataStore').getDataStore();
var router = express.Router();
var app = express();

router.post('/dashboards', function (req, res, next) {
  var allowedProperties = ['id', 'name', 'interval', 'urls'];
  if (!req.body.id) {
    var badRequestError = new Error('Property "id" missing in body');
    badRequestError.status = 400;
    return next(badRequestError);
  }
  // strict UUID v4: ^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}$
  if (!/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/.test(req.body.id)) {
    var badRequestError = new Error('Property "id" is not an UUID v4');
    badRequestError.status = 400;
    return next(badRequestError);
  }
  for (var parameter in req.body) {
    if (req.body.hasOwnProperty(parameter)) {
      if (allowedProperties.indexOf(parameter) === -1) {
        var badRequestError = new Error('Property "' + parameter + '" not allowed in body');
        badRequestError.status = 400;
        return next(badRequestError);
      }
    }
  }
  var newDashboard = {
    code : randToken.generate(8)
  };
  allowedProperties.forEach(function (property) {
    newDashboard[property] = req.body[property];
  });
  dataStore.getDashboard(newDashboard.id, function(err, dashboard) {
    if (err) { return next(err); }
    if (dashboard) {
      var conflictError = new Error('Duplicate Dashboard ID');
      conflictError.status = 409;
      return next(conflictError);
    }
    dataStore.createDashboard(newDashboard, function(err, createdDashboard) {
      if (err) { return next(err); }
      delete createdDashboard.code;
      res.status(201);
      res.json(createdDashboard);
    });
  });
});

router.get('/dashboards/:id?', function(req, res, next) {
  var id = req.params.id;
  if (!id) {
    var notFoundError = new Error('Dashboard ID missing from url');
    notFoundError.status = 404;
    return next(notFoundError);
  }
  dataStore.getDashboard(id, function(err, dashboard) {
    if (err) { return next(err); }
    if (!dashboard) {
      var notFoundError = new Error('Dashboard Not Found');
      notFoundError.status = 404;
      return next(notFoundError);
    }
    delete dashboard.code;
    res.status(200);
    res.json(dashboard);
  });
});

router.put('/dashboards/:id?', function(req, res, next) {
  var allowedProperties = ['id', 'code', 'interval', 'name', 'urls'];
  var id = req.params.id;
  if (!id) {
    var notFoundError = new Error('Dashboard ID missing from url');
    notFoundError.status = 404;
    return next(notFoundError);
  }
  for (var parameter in req.body) {
    if (req.body.hasOwnProperty(parameter)) {
      if (allowedProperties.indexOf(parameter) === -1) {
        var badRequestError = new Error('Parameter "' + parameter + '" not allowed in body');
        badRequestError.status = 400;
        return next(badRequestError);
      }
    }
  }
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
      var codeConflictError = new Error('Property \"code\" cannot be changed');
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

router.delete('/dashboards/:id?', function(req, res, next) {
  var id = req.params.id;
  if (!id) {
    var notFoundError = new Error('Dashboard ID missing from url');
    notFoundError.status = 404;
    return next(notFoundError);
  }
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

router.get('/dashboards/:id/code', function(req, res, next) {
  var id = req.params.id;
  if (!id) {
    var notFoundError = new Error('Dashboard ID missing from url');
    notFoundError.status = 404;
    return next(notFoundError);
  }
  dataStore.getDashboard(id, function(err, dashboard) {
    if (err) { return next(err); }
    if (!dashboard) {
      var notFoundError = new Error('Dashboard Not Found');
      notFoundError.status = 404;
      return next(notFoundError);
    }
    res.status(200);
    // TODO: Return dashboard ID as well?
    res.json({ code : dashboard.code });
  });
});

module.exports = router;
