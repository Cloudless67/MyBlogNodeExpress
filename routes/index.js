const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  res.render("login", {
    session: req.session,
  });
});

router.post("/login", (req, res) => {
  if (req.body.id !== process.env.ID) {
    res.render("error", {
      message: "존재하지 않는 ID입니다.",
    });
    return;
  }
  bcrypt.compare(req.body.password, process.env.PASSWORD, (err, result) => {
    if (err) throw err;
    if (result) {
      req.session.nickname = req.body.id;
      req.session.save((err) => {
        if (err) throw err;
        res.redirect("/");
      });
    } else {
      res.render("error", {
        message: "password가 일치하지 않습니다.",
      });
      return;
    }
  });
});

router.get("/logout", (req, res) => {
  delete req.session.nickname;
  req.session.save(() => {
    res.redirect("/");
  });
});

router.get("/", (req, res) => {
  req.database.query("SELECT * FROM post;", (err, rows) => {
    if (err) throw err;

    console.log(rows);
    res.render("category", {
      session: req.session,
      posts: rows,
      selectedCategory: "전체 글",
      categories: req.categories,
    });
  });
});

module.exports = router;
