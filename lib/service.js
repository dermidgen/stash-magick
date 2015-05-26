'use strict';

var os = require('os');
var util = require('util');
var debug = require('debug')('stash-magick');
var pkgcloud = require('pkgcloud');
var restify = require('restify');
var app = restify.createServer();

var config = require('../config.json');
var client = pkgcloud.storage.createClient(config);

app.use(restify.bodyParser({
  maxBodySize: 0,
  mapParams: true,
  mapFiles: false,
  overrideParams: false,
  keepExtensions: false,
  uploadDir: os.tmpdir(),
  multiples: true,
}));

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

  var stash = client.upload({
    container: config.stash.name,
    expire: '',
    remote: 'raw',
  });

  stash.on('error', function(err) {
    debug(err);
    res.send(500, { result: 'err', err: err });
  });

  stash.on('success', function(file) {
    debug(file);
    res.send(200, { status: 'OK', file: file });
  });

  if (req.params.key) {
    debug('Put updates image %s', req.params.key);
    stash.remote = req.params.key;
    req.pipe(stash);
    return;
  }

  debug('Put creates a new image');
  req.pipe(stash);
});


app.listen(9010, function() {
  debug('listening on %s', 9010);
});
