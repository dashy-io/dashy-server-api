'use strict';
var express = require('express');
var request = require('request');
var uuid = require('node-uuid');
var config = require('../config');
var validator = require('../lib/validator');
var errorGenerator = require('../lib/errorGenerator');
var users = require('../lib/users');
var tokens = require('../lib/tokens');
var router = express.Router();

// TODO: Test this
function validateGoogleTokenInfo(accessToken, cb) {
  var tokenInfoUrl = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + accessToken;
  request(tokenInfoUrl, function (err, apiRes, apiBody) {
    var tokenInfoResponse = JSON.parse(apiBody);
    if (err) { return cb(err); }
    if (tokenInfoResponse.audience !== config.googleClientId) {
      return cb(null, null);
    } else {
      return cb(null, tokenInfoResponse);
    }
  });
}

// TODO: Test this
function getGoogleUserProfile(accessToken, cb) {
  var peopleUrl = 'https://www.googleapis.com/plus/v1/people/me?access_token=' + accessToken;
  request(peopleUrl, function (err, apiRes, apiBody) {
    var peopleMeResponse = JSON.parse(apiBody);
    if (err) { cb(err); }
    if (peopleMeResponse.error)  {
      return cb(peopleMeResponse.error.message);
    }
    cb(null, peopleMeResponse);
  });
}

// TODO: Test this
router.post('/auth/google/login', function (req, res, next) {
  var login = req.body;
  var requiredProperties = ['access_token'];
  var validationError = validator.requireProperties(login, requiredProperties);
  if (validationError) {
    return next(errorGenerator.missingProperty(validationError.missingProperty));
  }
  validateGoogleTokenInfo(req.body.access_token, function (err, tokenInfo) {
    if (err) { return next(err); }
    if (!tokenInfo) {
      return next(errorGenerator.unauthorized('Cannot validate Google User'));
    }
    users.getByGoogleId(tokenInfo.user_id, function (err, user) {
      if (!user) {
        return next(errorGenerator.forbidden('User not found'));
      }
      tokens.create(user.id, function (err, token) {
        if (err) { return next(err); }
        res.status(200);
        res.json({ token : token });
      });
    });
  });
});

// TODO: Test this
router.post('/auth/google/signup', function (req, res, next) {
  var accessToken = req.body.access_token;
  validateGoogleTokenInfo(accessToken, function (err, tokenInfo) {
    if (err) { return next(err); }
    if (!tokenInfo) {
      return next(errorGenerator.unauthorized('Cannot validate Google User'));
    }
    getGoogleUserProfile(accessToken, function (err, linkedUserProfile) {
      if (err) { return next(err); }
      // TODO: Ensure that the scope contains email address
      users.getByGoogleId(linkedUserProfile.id, function (err, existingUser) {
        if (err) { return next(err); }
        if (existingUser) {
          return next(errorGenerator.userAlreadyExists());
        }
        var user = {
          id : 'user-' + uuid.v4(),
          profiles : {
            google: [ linkedUserProfile ]
          },
          dashboards : []
        };
        users.add(user, function (err, createdUser) {
          if (err) { return next(err); }
          res.status(201);
          res.json(createdUser);
        });
      });
   });
  });
});

// TODO: Test linking same google ID multiple times

module.exports = router;
