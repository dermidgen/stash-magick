'use strict';

var fs = require('fs');
var util = require('util');
var assert = require('assert');
var request = require('request');

var port = 9010;
var server = 'http://localhost:' + port;

// We'll use a public domain image for testing with
// jscs:disable
var stashSrc = 'http://upload.wikimedia.org/wikipedia/commons/9/9f/Cat_public_domain_dedication_image_0012.jpg'; // jshint ignore:line
var stashKey = '2390423490';
// jscs:enable

var fixtures = {
  thumbs: require('./fixtures/thumbnail.json'),
  operations: require('./fixtures/operations.json'),
};

var stashFile = {
  image: {
    value:  fs.createReadStream('./test/fixtures/sample.jpg'),
    options: {
      filename: 'sample.jpg',
      contentType: 'image/jpg',
    },
  },
};

if (!fs.existsSync('./test/fixtures')) {
  fs.mkdirSync('./test/fixtures');
}

describe('Stash-Magick REST Service', function() {
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
});

describe('Image Upload', function() {
  it('Can accept an uploaded image to stash', function(done) {
    this.timeout(30000);

    // In our first test here, let's make sure we
    // have a sample image to work with
    if (!fs.existsSync('./test/fixtures/sample.jpg')) {
      request(stashSrc, function(err, res) {
        assert(res.statusCode === 200);
        request.put({
          url: server + '/image/',
          formData: stashFile,
        }, function(err, res) {
          assert(res.statusCode === 200);
          done();
        });
      })
      .pipe(fs.createWriteStream('./test/fixtures/sample.jpg'));
    } else {
      request.put({
        url: server + '/image/',
        formData: stashFile,
      }, function(err, res) {
        assert(res.statusCode === 200);
        done();
      });
    }
  });

  it.skip('Can update an image in the stash', function(done) {
    this.timeout(30000);
    request.put({
      url: server + '/image/' + stashKey,
      formData: {
        image: {
          value:  fs.createReadStream('./test/fixtures/sample.jpg'),
          options: {
            filename: 'sample.jpg',
            contentType: 'image/jpg',
          },
        },
      },
    }, function(err, res) {
      assert(res.statusCode === 200);
      done();
    });
  });
});

describe('Image Transforms', function() {

  var formData = fixtures.thumbs;

  it.skip('Can create thumbnails from an upload stream', function(done) {
    this.timeout(30000);
    request.put({
      url: server + '/image/',
      formData: stashFile,
    }, function(err, res) {
      assert(res.statusCode === 200);
      done();
    });
  });

});
