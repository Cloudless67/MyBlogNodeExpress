var express = require('express');
var fs = require('fs');
const { time } = require('console');
var router = express.Router();

router.get('/', (req, res) => {
  fs.readFile("./public/writings/writings.json", "utf8", (e, writingsRAW) => {
    if(e) throw(e);
    let writings = JSON.parse(writingsRAW);
    let writing = writings[writings.length - 1];
    fs.readFile("./public/categories.json", "utf8", (e, categoriesRAW) => {
      if(e) throw(e);
      let categories = JSON.parse(categoriesRAW);
      Render(res, categories, writing);
    });
  })
});

/* GET home page. */
router.get('/:category/:title', function(req, res) {
  var category = req.params.category;
  var title = req.params.title;

  fs.readFile("./public/categories.json", "utf8", (e, categoriesRAW) => {
    if(e) throw(e);
    else{
      let categories = JSON.parse(categoriesRAW);
      if(categories.some(elem => elem.url == category)){
        Render(res, categories, title);
      }
      else{
        res.send("잘못된 접근입니다.");
      }
    }
  });
});

Render = (res, categories, title) => {
  fs.readFile(`./public/writings/${title}.json`, "utf8", (e, writingRAW) => {
    if(e) throw(e);
    let writing = JSON.parse(writingRAW);
    fs.readFile(`./public/writings/${writing.file}`, "utf8", (e, text) => {
      if(e) throw(e);
      res.render('index', { 
        title: writing.title, 
        mainText: text,
        dateTime: writing.date + " " + writing.time, 
        categories: categories
      });
    });
  });
}

module.exports = router;