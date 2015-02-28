'use strict';
var User =require('../models/user');
var tokens = require('../lib/tokens');
var errorGenerator = require('../lib/errorGenerator');

module.exports = function(req, res, next){
  var token = tokens.parseHeader(req.headers.authorization);
  if (!token) {
    return next(errorGenerator.unauthorized('Missing or invalid Authorization header'));
  }
  tokens.getUserId(token, function (err, id) {
    if (!id) {
      return next(errorGenerator.unauthorized('Invalid token'));
    }
    User.get(id, function (err, user) {
      if (err) { return next(err); }
      if (!user) {
        return next(errorGenerator.notFound('User associated with token'));
      }
      req.user = user;
      next();
    });
  });
}