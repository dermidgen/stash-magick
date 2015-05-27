'use strict';

var os = require('os');
var fs = require('fs');
var im = require('imagemagick-stream');
var util = require('util');
var extend = require('deep-extend');
var debug = require('debug')('stash-magick');
var pkgcloud = require('pkgcloud');
var restify = require('restify');
var app = restify.createServer();

var config = require('../config.json');
var client = pkgcloud.storage.createClient(config);

app.use(restify.CORS({
  origins: ['*'],
  credentials: false,
}));

// app.use(restify.queryParser());
app.use(restify.bodyParser({
  // maxBodySize: 0,
  // mapParams: true,
  // mapFiles: false,
  // overrideParams: true,
  // keepExtensions: true,
  // uploadDir: os.tmpdir(),
  multipartFileHandler: function(part, req) {

    debug('Stream image to stash');
    req.stash = client.upload({
      container: config.stash.name,
      expire: '',
      remote: part.filename,
    });

    // part.pipe(req.stash);
    // part.pause();
    req.fstream = part;
    req.fstream.pipe(req.stash);
  },
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

app.put('/image/:key', function(req, res, next) {
  if (req.params.key) {
    debug('Put updates image %s', req.params.key);
  } else {
    debug('Putting new image');
  }

  var options = {};
  if (req.params.transform) {
    var transform = JSON.parse(req.params.transform);
    if (transform) {
      options = extend(config.defaults.transform, transform);
    }
  }

  req.stash.on('error', function(err) {
    debug(err);
    res.send(500, { result: 'err', err: err });
  });

  req.stash.on('success', function(file) {
    debug('Complete');
    res.send(200, { status: 'OK', file: file });
  });


  req.fstream.on('data', function(){
    debug('recv data');
  });
  // req.fstream.pipe(fs.createWriteStream('./test/sample.resize.txt'));
  // req.fstream.resume();

  // next();
});

app.listen(9010, function() {
  debug('listening on %s', 9010);
});
