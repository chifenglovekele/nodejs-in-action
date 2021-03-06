var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs =require('fs');
var html = fs.readFileSync('index.html');

function handler (req, res) {
  // req.setEncoding('utf8');
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html)
}

function tick() {
  var now = new Date().toUTCString();
  io.sockets.send(now);
}

setInterval(tick, 1000);

app.listen(8080);