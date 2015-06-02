'use strict';

var debug = require('debug')('stash-magick:stash');
var pkgcloud = require('pkgcloud');
var multiparty = require('multiparty');
var Magick = require('./magick');


module.exports = function(options) {

  var config = options;
  var client = pkgcloud.storage.createClient(config.providers[0]);

  return function Stash(req, res, next) {
    debug('Stream images');

    var transforms = [];
    var form = new multiparty.Form();
    var transformer = new Magick(options);

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

      if (transforms.length > 0) {

        // Debug when the raw file has finished
        stash.on('success', function(file) {
          debug('Stashed image %s', file.name);
        });

        debug('thumbs');
        // Let's create some transform streams
        var thumbs = {
          small: transformer.thumbs.small,
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
          debug('Stashed thumbnail %s', file.name);
          res.send(200, JSON.stringify(file));
          next();
        });

        part.pipe(thumbs.small).pipe(thumbs.stash);
      } else {

        // Debug when the raw file has finshed
        stash.on('success', function(file) {
          debug('Stashed image %s', file.name);
          res.send(200, JSON.stringify(file));
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
  };
};


