var http = require('http');
var join = require('path').join;
var prase = require('url').parse;
var fs = require('fs');

var root = __dirname;

var server = http.createServer(function(req, res){
  var url = prase(req.url);
  var path = join(root, url.pathname);

  fs.stat(path, function(err, stat){
    if (err) {
      if ('ENOENT' == err.code) {
        res.statusCode = 404;
        res.end('Not Found');
      } else {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    } else {
      res.setHeader('Content-Length', stat.size);
      var stream = fs.createReadStream(path);
      stream.pipe(res);
      stream.on('error', function(err){
        res.statusCode = 500;
        res.end('Internal Server Error');
      })
    }
  })
})

server.listen('3000', function() {
  console.log('server listening on port 3000')
})
