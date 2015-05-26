'use strict';

var fs = require('fs');
var assert = require('assert');
var request = require('request');

var port = 9010;
var server = 'http://localhost:' + port;

// jscs:disable
var stashSrc = 'http://upload.wikimedia.org/wikipedia/commons/9/9f/Cat_public_domain_dedication_image_0012.jpg'; // jshint ignore:line
var stashKey = '2390423490';
// jscs:enable


var stashFile = {
  image: {
    value:  fs.createReadStream('./test/fixtures/sample.jpg'),
    options: {
      filename: 'sample.jpg',
      contentType: 'image/jpg',
    },
  },
};

describe('Stash-Magick API', function() {

  it('Reports a 404 for / requests', function(done) {
    request(server + '/', function(err, res) {
      assert(res.statusCode === 404);
      done();
    });
  });

  it('Returns stash information from storage backend', function(done) {
    request(server + '/image/container', function(err, res) {
      assert(res.statusCode === 200);
      done();
    });
  });

  it('Returns image information from the stash', function(done) {
    request(server + '/image/' + stashKey, function(err, res) {
      assert(res.statusCode === 200);
      done();
    });
  });

  it('Can accept an uploaded image to stash', function(done) {

    if (!fs.existsSync('./test/fixtures/sample.jpg')) {
      this.timeout(30000);
      request(stashSrc, function(err, res) {
        assert(res.statusCode === 200);
        request.put(server + '/image/', stashFile, function(err, res) {
          console.log(err, res);
          // assert(res.statusCode === 200);
          done();
        });
      })
      .pipe(fs.createWriteStream('./test/fixtures/sample.jpg'));
    } else {
      request.put(server + '/image/', stashFile, function(err, res) {
        assert(res.statusCode === 200);
        done();
      });
    }
  });

  it('Can accept an uploaded image to update the stash', function(done) {
    this.timeout(30000);
    request.put(server + '/image/' + stashKey, stashFile, function(err, res) {
      assert(res.statusCode === 200);
      done();
    });
  });


});
