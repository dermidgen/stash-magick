'use strict';

var os = require('os');
var fs = require('fs');
var im = require('imagemagick-stream');
var util = require('util');
var extend = require('deep-extend');
var debug = require('debug')('stash-magick');
var pkgcloud = require('pkgcloud');
var restify = require('restify');
var multiparty = require('multiparty');

var config = require('../config.json');
var client = pkgcloud.storage.createClient(config);
var app = restify.createServer();

app.get('/', function(req, res) {
  res.send(404, { status: 'Not Found' });
});

app.get('inspect/container', function(req, res) {
  client.getContainer('Photo-Stash-A', function(err, container) {
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

  debug('Get image %s', req.params.key);
  res.send(200, { status: 'OK' });
});

app.put('/image/:key', function(req, res) {
  debug('Upload image');
  var post = new multiparty.Form();
  post.on('part', function(part) {
    debug('filestream');
  });

  req.on('end', function() {
    debug('end');
  });

  req.pipe(post);
  // res.send(200);
});

app.listen(9010, function() {
  debug('listening on %s', 9010);
});
