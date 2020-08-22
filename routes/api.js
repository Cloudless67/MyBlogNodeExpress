const express = require('express');
const router = express.Router();
const fs = require('fs')
const multer  = require('multer')
const aws = require('aws-sdk')
const upload = multer({ dest: './public/uploads/' })

const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'eu-west-2';

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECURITY_ACCESS_KEY
});

router.put('/image/:name', upload.single('image'), (req, res) => {
  if(CheckAuth(req, res)){
    fs.rename(`./public/uploads/${req.file.filename}`, `./public/uploads/${req.params.name}`, () => {
      const s3Params = {
        Bucket: S3_BUCKET,
        Key: req.file.filename,
        ACL:'public-read',
        Body: fs.readFileSync(`./public/uploads/${req.params.name}`)
      };
  
      s3.upload(s3Params, (err, data) => {
        if(err) throw err;
        res.json(data);
      });
    });
  }
});

router.delete('/image/:name(*)', (req, res) => {
  if(CheckAuth(req, res)){
    let regex = /[a-zA-Z0-9]+$/
    const s3Params = {
      Bucket: S3_BUCKET,
      Key: regex.exec(req.params.name)[0]
    };

    s3.deleteObject(s3Params, (err, data) => {
      if(err) throw err;
      res.send(data);
    })
  }
});

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