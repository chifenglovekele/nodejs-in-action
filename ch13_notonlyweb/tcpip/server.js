var net = require('net');
net.createServer(function(socket) {
  socket.write('hello world!\r\n');
  socket.end();
  socket.on('close', function() {
    console.log('socket is closed!')
  })
}).listen(1337);
console.log('listening in 1337');