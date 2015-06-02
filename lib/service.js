'use strict';

var util = require('util');
var debug = require('debug')('stash-magick:service');
var restify = require('restify');

var config = require('../config.json');
var stash = require('./stash')(config);
var app = restify.createServer();

app.use(function(req, res, next) {
  debug('Request %s', req.getUrl().pathname, req.params);
  return next();
});

app.get('/', function(req, res) {
  res.send(404, { status: 'Not Found' });
});

app.get('inspect/container', function(req, res) {
  client.getContainer(config.stash, function(err, container) {
    debug(util.inspect(container, false, 1, true));
    res.send(200, container);
  });
});

app.get('/image/:key', function(req, res) {
  if (!req.params.key) {
    debug('Image request missing key');
    res.send(500, { message: 'Missing parameter' });
    return;
  }

  res.send(200, { status: 'OK' });
});

app.put('/image/:key', stash);

app.listen(9010, function() {
  debug('listening on %s', 9010);
});
