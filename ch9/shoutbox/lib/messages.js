var express = require('express');
var res = express.response;
res.message = function(msg, type) {
  type = type || 'info';
  var sess = this.req.session;
  sess.messages = sess.messages || [];
  sess.message.push({type: type, string: msg});
}

res.error = function(msg) {
  return this.message(msg, 'error');
}

module.exports = function(req, res, next) {
  res.locals.message = req.session.messages || [];
  res.locals.removeMessages = function() {
    req.session.messages = [];
  };
  next()
}