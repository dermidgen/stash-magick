'use strict';

module.exports = Provider;

var debug = require('debug')('stash-magick:provider');

function Provider(req, res, next) {
  debug('Request %s', req.getUrl().pathname, req.params);
  return next();
}
