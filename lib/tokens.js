'use strict';
var crypto = require('crypto');
var cache = require('memory-cache');

module.exports = {
  create : function(userId, cb) {
    if (!userId) { return cb(null, null); }
    crypto.randomBytes(128, function (err, buf) {
      if (err) { return cb(err); }
      var token = buf.toString('base64');
      var cacheKey = 'token:' + token;
      cache.put(cacheKey, userId);
      return cb(null, token);
    });
  },
  getUserId : function(token, cb) {
    if (!token) { return cb(null, null); }
    var cacheKey = 'token:' + token;
    return cb(null, cache.get(cacheKey));
  },
  parseHeader : function (authorizationHeader) {
    if (!authorizationHeader) { return null; }
    var authoriaztion = authorizationHeader.split(' ');
    if (authoriaztion.length != 2) { return null; }
    if (authoriaztion[0] !== 'Bearer') { return null; }
    return authoriaztion[1];
  }
};
