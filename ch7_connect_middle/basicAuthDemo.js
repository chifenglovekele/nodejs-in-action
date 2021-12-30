var connect = require('connect')
const basicAuth = require('basic-auth');
const users = {
  tobi: 'ferret',
  loki: 'bar'
}
var app = connect()
  .use(function(req, res){
    const author = basicAuth(req);
    console.log(author)
    console.log(author.name, author.pass)
    res.end('im a secret\n');
  })
app.listen(3000, function(){
  console.log('started')
})