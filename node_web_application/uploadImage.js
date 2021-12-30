var http = require('http');
var socketio = require('socket.io');
var io;
var EventEmitter = require('events').EventEmitter;
var formidable = require('formidable');

const event = new EventEmitter();

var server = http.createServer(function(req, res) {
  if ('/' == req.url) {
    switch (req.method) {
      case 'GET':
        show(res);
        break;
      case 'POST':
        upload(req, res);
        break;
      default:
        badRequest(res);
    }
  } else {
    notFound(res);
  }
});

server.listen('3000', function() {
  console.log('server listening on port 3000')
})

function socketRun(server) {
  io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function(socket) {
    event.on('progress', function(val) {
      console.log('event.emit' + val);
      socket.emit('progress', val);
    })
  })
}

socketRun(server);

function show(res) {
  var html = '<html><head><title>TOdo List</title></head><body>'
   + '<div id="messages"></div>'
   + '<form method="post" action="/" enctype="multipart/form-data">'
   + '<p><input type="text" name="name" /></p>'
   + '<p><input type="file" name="file" /></p>'
   + '<p><input type="submit" value="Upload" /></p>'
   + '</form><script type="text/javascript" src="/socket.io/socket.io.js"></script><script type="text/javascript" src="http://code.jquery.com/jquery-1.8.0.min.js"></script>'
   + '<script type="text/javascript">'
   + 'var socket = io.connect();'
   + '$(document).ready(function() {console.log(123);'
   + 'socket.on("progress", function(result) {$("#messages").text(result)})'
   + '})'
   + '</script></body></html>';
  
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html);
}

function notFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('notFound')
}

function badRequest(res) {
  res.statusCode = 400;
  res.setHeader('Content-Type', 'text/plain');
  res.end('badRequest')
}

var querystring = require('querystring');
function isFormData(req) {
  var type = req.headers['content-type'] || '';
  return 0 == type.indexOf('multipart/form-data');
}
function upload(req, res) {
  if (!isFormData(req)) {
    res.statusCode = 400;
    res.end('badRequest: expecting multipart/form-data');
    return;
  }
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    console.log(fields);
    console.log(files);
    show(res);
    // res.end('upload complete!');
  });
  // form.on('field', function(field, value) {
  //   console.log(field);
  //   console.log(value);
  // })
  // form.on('file', function(name, file) {
  //   console.log(name);
  //   console.log(file);
  // })
  // form.on('end', function(){
  //   res.end('upload complete!');
  // })
  form.on('progress', function(bytesReceived, bytesExpected) {
    var percent = Math.round(bytesReceived / bytesExpected * 100);
    console.log(percent);
    event.emit('progress', percent)
  })
}