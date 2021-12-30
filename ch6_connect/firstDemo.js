var connect = require('connect');
var app = connect();
app
  .use(loggerSetup(':method :url'))
  .use('/admin', restrict)
  .use('/admin', admin)
  .use(hello)
  .listen(3000, function(){
  console.log('server start at port 3000')
});

function logger(req, res, next) {
  console.log('%s %s', req.method, req.url);
  next();
}

function loggerSetup(format) {
  var regexp = /:(\w+)/g;
  return function logger(req, res, next) {
    var str = format.replace(regexp, function(match, property){
      console.log(match, property)
      return req[property];
    })
    console.log(str);
    next();
  }
}

function hello(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hello world');
}

// 实现basic认证的中间件
function restrict(req, res, next) {
  var authorization = req.headers.authorization;
  if (!authorization) return next(new Error('unauthorized'));
  var parts = authorization.split(' ');
  var schema = parts[0];
  var auth = new Buffer(parts[1], 'base64').toString().split(':');
  var user = auth[0];
  var pass = auth[1];
  authenticateWithDatabase(user, pass, function(err) {
    if (err) return next(err);
    next();
  })
}

// 显示管理面板的中间件
function admin(req, res, next) {
  switch(req.url) {
    case '/':
      res.end('try /users');
      break;
    case '/users':
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(['tobi', 'loki', 'jane']));
      break;
  }
}

