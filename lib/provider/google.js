
module.exports = Google;

var util = require('util');
var gcloud = require('gcloud');
var debug = reqire('debug');

var Provider = require('./provider');

util.inherits(Provider, Google);
function Google(req, res, next) {
  Provider.call(this);
};
