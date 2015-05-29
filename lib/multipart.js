var debug = require('debug')('stash-magick:multipart');
var Busboy = require('busboy');

module.exports = function(options) {
  'use strict';

  return function(req, res, next) {
    debug('using busboy');
    var busboy = new Busboy({headers: req.headers});
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      // Pipe
      debug(filename);
    });
    busboy.on('finish', function() {
      res.send(303, { Connection: 'close', Location: '/' });
      res.end();
      next();
    });
    req.pipe(busboy);
  };
}
