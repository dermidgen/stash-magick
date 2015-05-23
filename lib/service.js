'use strict';

var util = require('util');
var debug = require('debug')('stash-magick');
var pkgcloud = require('pkgcloud');
var restify = require('restify');
var app = restify.createServer();

var config = require('../config.json');
var client = pkgcloud.storage.createClient(config);

app.get('/', function(req, res) {
  res.send(200, { status: 'OK' });
});

app.get('/image/:key', function(req, res) {
  res.send(200, { status: 'OK' });
});

app.put('/image/:key', function(req, res) {
  res.send(200, { status: 'OK' });
});

client.getContainer('Photo-Stash-A', function(err, container) {
  debug(util.inspect(container, false, 0, true));
});

app.listen(9010, function() {
  debug('listinging on %s', 9010);
});
