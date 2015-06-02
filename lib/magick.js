'use strict';

module.exports = Magick;

var util = require('util');
var debug = require('debug')('stash-magick:magick');
var im = require('imagemagick-stream');

function Magick(options) {

  this.defaults = {
    thumbs: {
      small: {
        size: '100x75',
        crop: true,
        scale: true,
      },
    },
  };

  this.config = util._extend(this.defaults, options);

  this.thumbs = {
    small: im().resize(this.config.thumbs.small.size).quality(90),
  };
}
