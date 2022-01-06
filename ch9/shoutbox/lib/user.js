var redis = require('redis');
var bcrypt = require('bcrypt');
var db = redis.createClient();

module.exports = User;

function User(obj) {
  for (var key in obj) {
    this[key] = obj[key]
  }
}

// 新增用户
User.prototype.save = function(fn) {
  if (this.id) { // 用户已存在
    this.update(fn);
  } else {
    var user = this;
    db.incr('user:ids', function(err, id) { // 创建唯一ID
      if (err) return fn(err);
      user.id = id; // 设定ID
      user.hashPassword(function(err) { // 密码哈希
        if (err) return fn(err);
        user.update(fn); // 保存用户属性
      })
    })
  }
}

// 更新用户属性
User.prototype.update = function(fn) {
  var user = this;
  var id = user.id;
  db.set('user:id:' + user.name, id, function(err) { // 用名称索引用户id
    if (err) return fn(err)
    db.hmset('user:' + id, user, function(err) { // 用reids哈希存储数据
      fn(err);
    })
  })
}

// 密码加密
User.prototype.hashPassword = function(fn) {
  var user = this;
  bcrypt.genSalt(12, function(err, salt) {
    if (err) return fn(err);
    user.salt = salt;
    bcrypt.hash(user.pass, salt, function(err, hash) {
      if (err) return fn(err);
      user.pass = hash;
      fn();
    })
  })
}

// 通过名称获取用户
User.getByName = function(name, fn) {
  console.log('name----', name)
  User.getId(name, function(err, id) {
    if (err) return fn(err);
    User.get(id, fn);
  })
}

// 通过名称获取id
User.getId = function(name, fn) {
  db.get('user:id' + name, fn);
}

// 通过id获取普通user对象哈希
User.get = function(id, fn) {
  console.log('id----', id)
  db.hgetall('user:' + id, function(err, user) {
    if (err) return fn(err)
    console.log('user----', user)
    fn(null, new User(user));
  })
}

// 认真用户的名称和密码
User.authenticate = function(name, pass, fn) {
  User.getByName(name, function(err, user) {
    if (err) return fn(err);
    if (!user.id) return fn();
    bcrypt.hash(pass, user.salt, function(err, hash) {
      if (err) return fn(err);
      if (hash === user.pass) return fn(null, user);
      fn();
    })
  })
}
