var express = require('express');
var router = express.Router();
var fs = require('fs')
var multer  = require('multer')
var upload = multer({ dest: './public/uploads/' })

router.put('/image/:name', upload.single('image'), (req, res) => {
  if(CheckAuth(req, res)){
    fs.rename(`./public/uploads/${req.file.filename}`, `./public/uploads/${req.params.name}`, () => res.end());
  }
})

router.delete('/image/:name', (req, res) => {
  if(CheckAuth(req, res)){
    fs.unlink(`./public/uploads/${req.params.name}`, (err) => {
      if (err) throw err;
      console.log(`${req.body.name} was deleted`);
    });
  }
})

CheckAuth = (req, res) => {
  if(req.session.nickname){
    return true;
  }
  else{
    res.render('error', {
      message: '비정상적인 접근입니다.'
    })
    return false;
  }
}

module.exports = router;