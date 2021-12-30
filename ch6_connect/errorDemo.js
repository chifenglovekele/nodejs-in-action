var connect = require('connect');
var url = require('url');

var api = connect()
  .use(users)
  .use(pets)
  .use(errorHandler);

var app = connect();
app
  .use(hello)
  .use('/api', api)
  .use(errorPage)
  .listen(3000, function(){
    console.log('server start')
  });

function hello(req, res, next) {
  if (req.url.match(/^\/hello/)) {
    res.end('hello world\n');
  } else {
    next();
  }
}

var db = {
  users: {
    'tobi': {name: 'tobi'},
    'loki': {name: 'loki'},
    'jane': {name: 'jane'}
  }
}

function users(req, res, next) {
  console.log(req.url)
  console.log(url.parse(req.url))
  var match = req.url.match(/^\/user\/(.+)/);
  if (match) {
    console.log(match)
    var user = db.users[match[1]];
    if (user) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(user));
    } else {
      var err = new Error('User not found');
      err.notFound = true;
      next(err);
    }
  } else {
    next()
  }
}

function pets(req, res, next) {
  if (req.url.match(/^\/pet\/(.+)/)) {
    foo();
  } else {
    next()
  }
}

function errorHandler(err, req, res, next) {
  console.error(err.stack)
  res.setHeader('Content-Type', 'application/json');
  if (err.notFound) {
    res.statusCode = 404;
    res.end(JSON.stringify({error: err.message}));
  } else {
    res.statusCode = 500;
    res.end(JSON.stringify({error: 'Internal Server Error'}));
  }
}

function errorPage(err, req, res, next) {
  if (err) {
    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 404;
    res.end('<html><body>Client error</body></html>')
  }
}