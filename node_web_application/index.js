var http = require('http');
var url = require('url');
var items = [];
var server = http.createServer(function (req, res){
  switch (req.method) {
    case 'POST':
      var item = '';
      req.setEncoding('utf8');
      req.on('data', function (chunk) {
        item += chunk.toString();
      });
      req.on('end', function () {
        items.push(item);
        res.end('OK\n');
      })
      break;
    
    case 'GET':
      var body = items.map((item, i) => {
        return i + ')' + item;
      }).join('\n');
      res.setHeader('Content-Length', Buffer.byteLength(body));
      res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
      res.end(body)
      break;
  }
})
server.listen('3000', function() {
  console.log('server listening on port 3000');
})