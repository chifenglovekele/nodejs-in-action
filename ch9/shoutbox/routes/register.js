var User = require('../lib/user');

exports.form = function(req, res) {
  res.render('register', {title: 'Register'});
}

exports.submit = function(req, res, next) {
  console.log('req.body----', req.body)
  var data = req.body;
  User.getByName(data.name, function(err, user) {
    if (err) return next(err)
    if (user.id) {
      res.error("Username already taken");
      res.redirect('back');
    } else {
      user = new User({
        name: data.name,
        pass: data.pass
      });
      user.save(function(err) {
        if (err) return next(err)
        req.session.uid = user.id;
        res.redirect('/');
      })
    }
  })
}

