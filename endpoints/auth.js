'use strict';
var express = require('express');
var request = require('request');
var crypto = require('crypto');
var cache = require('memory-cache');
var uuid = require('node-uuid');
var validator = require('../lib/validator');
var errorGenerator = require('../lib/errorGenerator');
var dataStore = require('../lib/dataStore').getDataStore();
var router = express.Router();

function validateGoogleTokenInfo(accessToken, cb) {
  var tokenInfoUrl = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + accessToken;
  request(tokenInfoUrl, function (err, apiRes, apiBody) {
    var tokenInfoResponse = JSON.parse(apiBody);
    if (err) { return cb(err); }
    if (tokenInfoResponse.audience !== process.env.GOOGLE_CLIENT_ID) {
      return cb(null, null);
    } else {
      return cb(null, tokenInfoResponse);
    }
  });
}

function getGoogleUserProfile(accessToken, cb) {
  var peopleUrl = 'https://www.googleapis.com/plus/v1/people/me?access_token=' + accessToken;
  request(peopleUrl, function (err, apiRes, apiBody) {
    var peopleMeResponse = JSON.parse(apiBody);
    if (err) { cb(err) }
    cb(null, peopleMeResponse);
  });
}

function createToken(userId, cb) {
  crypto.randomBytes(128, function (err, buf) {
    if (err) { return cb(err); }
    var token = buf.toString('base64');
    var cacheKey = 'token:' + token;
    cache.put(cacheKey, userId);
    return cb(null, token);
  });
}

router.post('/auth/google/login', function (req, res) {
  validateGoogleTokenInfo(req.body.access_token, function (err, tokenInfo) {
    if (err) { return next(err); }
    if (!tokenInfo) {
      return res.status(401);
    }
    dataStore.getUserIdByGoogleUserId(tokenInfo.user_id, function (err, userId) {
      if (!userId) {
        res.status(403);
        return res.json({ error : 'User not found' });
      }
      createToken(userId, function (err, token) {
        if (err) { return next(err); }
        res.status(200);
        res.json({ token : token });
      });
    });
  });
});

router.post('/auth/google/signup', function (req, res) {
  var accessToken = req.body.access_token;
  validateGoogleTokenInfo(accessToken, function (err, tokenInfo) {
    if (err) { return next(err); }
    if (!tokenInfo) {
      return res.status(401);
    }
    getGoogleUserProfile(accessToken, function (err, linkedUserProfile) {
      if (err) { return next(err); }
      dataStore.getUserIdByGoogleUserId(linkedUserProfile.id, function (err, userId) {
        if (err) { return next(err); }
        if (userId) {
          res.status(409);
          return res.json({ error: 'User already exists'} );
        }
        var user = {
          id : 'user-' + uuid.v4(),
          linkedProfiles : {
            google: linkedUserProfile
          }
        };
        dataStore.createUser(user, function (err, createdUser) {
          if (err) { return next(err); }
          res.status(201);
          res.json(createdUser);
        });

      });
   });
  });
});

module.exports = router;
