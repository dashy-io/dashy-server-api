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
    req.user = id;
    next();
  });
}