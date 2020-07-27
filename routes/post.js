var express = require('express');
var moment = require('moment');
var fs = require('fs');
const { render } = require('../app');
const { ifError } = require('assert');
const { isNumber } = require('util');
var router = express.Router();

router.get('/write', (req, res) => {
  res.render("write", {
    session: req.session,
    title: "Write",
    categories: req.categories
  })
});

router.post('/write', (req, res) => {
  let category = req.database.escape(req.body.category);
  let title = req.database.escape(req.body.title);
  let body = req.database.escape(req.body.body);
  req.database.query('INSERT INTO post (category, title, writtentime, body, views)' + 
  `VALUES (${category}, ${title}, '${moment().format()}', ${body}, 0);`, (err, result) => {
    if(err) throw err;
    console.log(result);
    res.status(200).redirect('/');
  })
})

router.post('/update', (req, res) => {
  req.database.query(`SELECT * FROM POST WHERE id = ${req.body.id};`, (err, post) => {
    if (err) throw err;
    res.render("update", {
      session: req.session,
      title: post[0].title, 
      _category: post[0].category, 
      body: post[0].body,
      id: req.body.id,
      categories: req.categories
    })
  })
});

router.post('/update/process', (req, res) => {
  let category = req.database.escape(req.body.category);
  let title = req.database.escape(req.body.title);
  let body = req.database.escape(req.body.body);
  req.database.query('UPDATE post ' + 
  `SET category = ${category}, title = ${title}, writtentime = '${moment().format()}',` + 
  ` body = ${body} WHERE id = ${req.body.id};`, (err, result) => {
    if(err) throw err;
    console.log(result);
    res.status(200).redirect('/');
  })
});

router.post('/delete', (req, res) => {
  req.database.query(`DELETE FROM post WHERE id = ${req.body.id};`, (err) => {
    if (err) throw err;
    res.status(200).redirect('/');
  })
});

router.get('/:id', (req, res) => {
  if(Number.isInteger(Number(req.params.id))){
    Render(res, req, req.params.id);
  }
  else{
    res.send('비정상적인 접근입니다.');
  }
});

Render = (res, req, postId) => {
  req.database.query(`SELECT * FROM POST WHERE id = ${postId};`, (err, post) => {
    if (err){
      throw err;
    }
    if(post.length === 0){
      res.send('존재하지 않는 글입니다.');
    }
    res.status(200).render('post', {
      session: req.session,
      post: post[0],
      categories: req.categories
    })
  })
}

module.exports = router;