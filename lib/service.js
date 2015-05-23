'use strict';

var util = require('util');
var debug = require('debug')('stash-magick');
var pkgcloud = require('pkgcloud');
var restify = require('restify');
var app = restify.createServer();

var config = require('../config.json');
var client = pkgcloud.storage.createClient(config);

app.get('/', function(req, res) {
  res.send(404, { status: 'Not Found' });
});

app.get('/image/:key', function(req, res) {
  if (!req.params.key) {
    debug('Image request missing key');
    res.send(500, { message: 'Missing parameter' });
    return;
  }

  debug('Get image %s', req.params.key);
  res.send(200, { status: 'OK' });
});

app.put('/image/:key', function(req, res) {
  if (req.params.key) {
    debug('Put image %s', req.params.key);
    res.send(200, { status: 'OK' });
    return;
  }

  debug('Put new image');
  res.send(200, { status: 'OK' });
});

app.get('inspect/container', function(req, res) {
  client.getContainer('Photo-Stash-A', function(err, container) {
    res.send(200, container);
    debug(util.inspect(container, false, 0, true));
  });
});

app.listen(9010, function() {
  debug('listening on %s', 9010);
});
