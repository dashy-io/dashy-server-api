'use strict';
var uuid = require('node-uuid');
var express = require('express');
var validator = require('../lib/validator');
var errorGenerator = require('../lib/errorGenerator');
var tokens = require('../lib/tokens');
var dataStore = require('../lib/dataStore').getDataStore();
var router = express.Router();
var app = express();

function clone(input) {
  return JSON.parse(JSON.stringify(input));
}

router.post('/users', function (req, res, next) {
  var user = clone(req.body);
  var requiredProperties = ['email', 'name', 'dashboards'];
  var validationError = validator.requireProperties(user, requiredProperties);
  if (validationError) {
    return next(errorGenerator.missingProperty(validationError.missingProperty));
  }
  validationError = validator.allowProperties(user, requiredProperties);
  if (validationError) {
    return next(errorGenerator.unexpectedProperty(validationError.unexpectedProperty));
  }
  user.id = 'user-' + uuid.v4();
  dataStore.createUser(user, function (err, createdUser) {
    if (err) { return next(err); }
    res.status(201);
    res.json(createdUser);
  });
});

router.get('/users/:id?', function (req, res, next) {
  var id = req.params.id;
  if (!id) {
    return next(errorGenerator.missingParameter('id'));
  }
  dataStore.getUser(id, function (err, user) {
    if (err) { return next(err); }
    if (!user) {
      return next(errorGenerator.notFound('User'));
    }
    res.status(200);
    res.json(user);
  });
});

// TODO: Test this
router.get('/user', function (req, res, next) {
  var token = tokens.parseHeader(req.headers.authorization);
  tokens.getUserId(token, function (err, id) {
    if (!id) {
      return next(errorGenerator.unauthorized('Cannot access requested User'));
    }
    dataStore.getUser(id, function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        return next(errorGenerator.notFound('User'));
      }
      user.emails = user.linkedProfiles.google.emails.map(function (email) { return email.value });
      user.name = user.linkedProfiles.google.displayName || user.emails[0];
      user.imageUrl = user.linkedProfiles.google.image.url.replace('?sz=50', '');
      user.domain = user.linkedProfiles.google.domain;
      res.status(200);
      res.json(user);
    });
  });
});

router.put('/users/:id?', function (req, res, next) {
  var id = req.params.id;
  var user = clone(req.body);
  var requiredProperties = ['email', 'name', 'dashboards'];
  var allowedProperties = ['id', 'email', 'name', 'dashboards'];
  if (!id) {
    return next(errorGenerator.missingParameter('id'));
  }
  var validationError = validator.allowMatchingId(user, id);
  if (validationError) {
    return next(errorGenerator.notMatchingProperty(validationError.notMatchingProperty));
  }
  validationError = validator.requireProperties(user, requiredProperties);
  if (validationError) {
    return next(errorGenerator.missingProperty(validationError.missingProperty));
  }
  validationError = validator.allowProperties(user, allowedProperties);
  if (validationError) {
    return next(errorGenerator.unexpectedProperty(validationError.unexpectedProperty));
  }
  dataStore.getUser(id, function (err, existingUser) {
    if (err) { return next(err); }
    if (!existingUser) {
      return next(errorGenerator.notFound('User'));
    }
    dataStore.updateUser(id, user, function(err, updatedUser) {
      if (err) { return next(err); }
      res.status(200);
      res.json(updatedUser);
    });
  });
});

router.delete('/users/:id?', function (req, res, next) {
  var id = req.params.id;
  if (!id) {
    return next(errorGenerator.missingParameter('id'));
  }
  dataStore.deleteUser(id, function (err, deleted) {
    if (err) { return err; }
    if (!deleted) {
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
  dataStore.getUser(userId, function (err, user) {
    if (err) { return next(err); }
    if (!user) {
      return next(errorGenerator.notFound('User'));
    }
    dataStore.getDashboardByCode(dashboardConnect.code, function(err, dashboard) {
      if (err) { return next(err); }
      if (!user) {
        return next(errorGenerator.notFound('Dashboard'));
      }
      // TODO: This should always be an array
      if (!user.dashboards) {
        user.dashboards = [];
      }
      user.dashboards.push(dashboard.id);
      dataStore.updateUser(user.id, user, function (err, updatedUser) {
        res.status(201);
        res.json(updatedUser.dashboards);
      });
    });
  });
});

module.exports = router;
