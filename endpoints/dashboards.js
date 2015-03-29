'use strict';
var express = require('express');
var randToken = require('rand-token');
var errorGenerator = require('../lib/errorGenerator');
var requireAuthorization = require('../lib/authorizationMiddleware');
var dashboards = require('../lib/dashboards');
var uuid = require('node-uuid');
var config = require('../config');
var router = express.Router();

router.post('/dashboards', function (req, res, next) {
  var allowedProperties = [ 'name' ];
  for (var parameter in req.body) {
    if (req.body.hasOwnProperty(parameter)) {
      if (allowedProperties.indexOf(parameter) === -1) {
        var badRequestError = new Error('Property "' + parameter + '" not allowed in body');
        badRequestError.status = 400;
        return next(badRequestError);
      }
    }
  }
  var dashboardPrefix = config.env === "production"
    ? "dashboard-"
    :  "test-dashboard-";
  var newDashboard = {
    id : dashboardPrefix + uuid.v4(),
    code : randToken.generate(6)
  };
  allowedProperties.forEach(function (property) {
    newDashboard[property] = req.body[property];
  });
  dashboards.get(newDashboard.id, function(err, dashboard) {
    if (err) { return next(err); }
    if (dashboard) {
      var conflictError = new Error('Duplicate Dashboard ID');
      conflictError.status = 409;
      return next(conflictError);
    }
    dashboards.add(newDashboard, function(err, createdDashboard) {
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
  dashboards.get(id, function (err, dashboard) {
    if (err) { return next(err); }
    if (!dashboard) {
      var notFoundError = new Error('Dashboard Not Found');
      notFoundError.status = 404;
      return next(notFoundError);
    }
    dashboard.interval = dashboard.interval || 60;
    delete dashboard.code;
    res.status(200);
    res.json(dashboard);
  });
});

router.put('/dashboards/:id?', requireAuthorization, function(req, res, next) {
  var allowedProperties = ['id', 'code', 'interval', 'name', 'urls'];
  var id = req.params.id;
  if (!id) {
    var notFoundError = new Error('Dashboard ID missing from url');
    notFoundError.status = 404;
    return next(notFoundError);
  }
  if (!req.user.dashboards || 
      req.user.dashboards.indexOf(id) === -1) {
    return next(errorGenerator.forbidden('You can\'t update this resource'));
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
  if (!dashboard.id) {
    dashboard.id = id;
  }
  if (dashboard.interval < 10) {
    dashboard.interval = 10;
  }
  var bodyId = dashboard.id;
  var bodyCode = dashboard.code;
  if (bodyId !== id) {
    var idConflictError = new Error('Dashboard ID in request body does not match ID in url');
    idConflictError.status = 409;
    return next(idConflictError);
  }
  dashboards.get(id, function(err, currentDashboard) {
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
    dashboards.update(dashboard, function(err, updatedDashboard) {
      if (err) { return next(err); }
      res.status(200);
      res.json(updatedDashboard);
    });
  });
});

router.delete('/dashboards/:id?', requireAuthorization, function(req, res, next) {
  var id = req.params.id;
  if (!id) {
    var notFoundError = new Error('Dashboard ID missing from url');
    notFoundError.status = 404;
    return next(notFoundError);
  }
  if (!req.user.dashboards || 
      req.user.dashboards.indexOf(id) === -1) {
    return next(errorGenerator.forbidden('You can\'t update this resource'));
  }
  dashboards.remove(id, function(err, removed) {
    if (err) { return next(err); }
    if (!removed) {
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
  dashboards.get(id, function(err, dashboard) {
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
