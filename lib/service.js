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

app.use(function(req, res, next) {
  debug('Request %s', req.getUrl().pathname, req.params);
  return next();
});

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

  // debug('Get image %s', req.params.key);
  res.send(200, { status: 'OK' });
});

app.put('/image/:key', function(req, res, next) {
  debug('Put image');
  return next('attachments');
});

app.put({
  name: 'attachments',
  path: '/image/:key',
}, function(req, res, next) {
  debug('Stream images');

  var transforms = [];
  var form = new multiparty.Form();

  form.on('error', function(err) {
    debug(err);
    res.send(500, JSON.stringify({ result: 'err', err: err }));
    next();
  });

  form.on('field', function(name, value) {
    if (name === 'transforms') {
      transforms.push(value);
    }
  });

  form.on('part', function(part) {

    part.on('error', function(err) {
      res.send(500, JSON.stringify({ result: 'err', err: err }));
      next();
    });

    part.on('end', function() {
      debug('filestream complete');
    });

    // Pipe to our stash backend
    var stash = client.upload({
      container: config.stash.name,
      expire: '',
      remote: 'sample.jpg',
    });

    stash.on('error', function(err) {
      debug(err);
      res.send(500, JSON.stringify({ result: 'err', err: err }));
      next();
    });

    stash.on('success', function(file) {
      debug('Stashed image');
    });

    if (transforms.length > 0) {
      debug('thumbs');
      // Let's create some transform streams
      var small = config.defaults.transform.thumbs.small.width + 'x' +
                 config.defaults.transform.thumbs.small.height;

      var thumbs = {
        small: im().resize(small).quality(90),
        stash: client.upload({
          container: config.stash.name,
          expire: '',
          remote: 'sample-thumb.jpg',
        }),
      };

      // Pipe to our stash backend
      thumbs.stash.on('error', function(err) {
        debug(err);
        res.send(500, JSON.stringify({ result: 'err', err: err }));
        next();
      });

      thumbs.stash.on('success', function(file) {
        debug('Stashed thumbnail');
        res.send(200);
        next();
      });

      part.pipe(thumbs.small).pipe(thumbs.stash);
    } else {
      stash.on('success', function(file) {
        res.send(200);
        next();
      });
    }

    part.pipe(stash);
    part.resume();
  });

  form.on('close', function() {
    debug('close');
  });

  // Adding a callback here will force files to buffer to disk
  form.parse(req);
});

app.listen(9010, function() {
  debug('listening on %s', 9010);
});
