var net = require('net');
var socket = net.connect({
  host: process.argv[2],
  port: 22
})

socket.setEncoding('utf8');
socket.once('data', function(chunk) {
  console.log('ssh server version: %j', chunk.trim())
  socket.end();
})