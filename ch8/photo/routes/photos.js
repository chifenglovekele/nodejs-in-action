var Photo = require('../models/Photo');
var path = require('path');
var join = path.join;
var fs = require('fs');
var formidable = require("formidable");

var photolist = [];
photolist.push({
  name: 'Node.js Logo',
  path: 'http://nodejs.org/images/logos/nodejs-green.png'
});

photolist.push({
  name: 'Ryan Speaking',
  path: 'http://nodejs.org/images/ryan-speaker.jpg'
})

exports.list = function (req, res, next) {
  Photo.find({}, function (err, photos) {
    if (err) return next(err);
    res.render('photos', {
      title: 'Photos',
      photolist: photos
    })
  })
  // res.render('photos', {
  //   title: 'Photos',
  //   photolist: photolist
  // })
}

// var express = require('express')
// var router = express.Router();

/* GET users listing. */
// router.get('/', list);

// module.exports = router;

exports.form = function (req, res) {
  res.render('photos/upload', {
    title: 'Photo Upload'
  })
}

exports.submit = function (dir) {
  return function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      console.log(req)
      console.log('fields', fields)
      console.log('files', files)
      console.log(files.image.originalFilename)
      var img = files.image;
      var name = fields.name || img.originalFilename;
      var path = join(dir, img.originalFilename);
      // fs.rename(img.filepath, path, function(err){
        
      // })
      fs.readFile(img.filepath, function (err, data) {
        if (err) return next(err);
        fs.writeFile(path, data, function (err) {
          if (err) return next(err);
          Photo.create({
            name: name,
            path: img.originalFilename
          }, function(err) {
            if (err) return next(err);
            res.redirect('/photos');
          })
        });
      });
    })
  }
}

exports.download = function(dir) {
  return function(req, res, next) {
    var id = req.params.id;
    Photo.findById(id, function(err, photo) {
      if (err) return next(err);
      var path = join(dir, photo.path)
      // res.sendfile(path);
      console.log(photo.name)
      res.download(path, photo.name+'.png');
    })
  }
}