var connect = require('connect');
var directory = require('serve-index');
var static = require('serve-static');
var app = connect()
  .use(directory('node_modules'))
  .use(static('node_modules'))
app.listen(3000)