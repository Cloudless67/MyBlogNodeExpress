const express = require("express");
const moment = require("moment");
const fs = require("fs");
const { render } = require("../app");
const { ifError } = require("assert");
const bcrypt = require("bcrypt");
const marked = require("marked");
const hljs = require("highlight.js");
const katex = require("katex");
const { info } = require("console");
const { highlight } = require("highlight.js");
const router = express.Router();
hljs.registerLanguage("pug", require("../src/pug.js"));

marked.setOptions({
  renderer: new marked.Renderer(),
  pedantic: false,
  gfm: true,
  breaks: true,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
});

const renderer = {
  code(code, infostring) {
    const validLanguage = hljs.getLanguage(infostring)
      ? infostring
      : "plaintext";
    if (infostring === "TeX") {
      return katex.renderToString(code, {
        displayMode: true,
        throwOnError: false,
      });
    } else {
      return `
<pre class = "hljs ${infostring}"><code>${
        hljs.highlight(validLanguage, code).value
      }</code></pre>`;
    }
  },
  codespan(code) {
    if (code[0] === "$") {
      return katex.renderToString(code.substring(1), {
        throwOnError: false,
      });
    } else {
      return false;
    }
  },
};

const tokenizer = {
  // Match for inline $ ... $ syntax
  codespan(src) {
    const match = src.match(/^([`$])(?=[^\s\d$`])([^`$]*?)\1(?![`$])/);
    if (match) {
      return {
        type: "codespan",
        raw: match[0],
        text: match[1] === "$" ? `$${match[2].trim()}` : match[2].trim(),
      };
    }
    return false;
  },
  // Disable inline text when meeting $ inline
  inlineText(src, inRawBlock, smartypants) {
    const cap = src.match(
      /^([`$]+|[^`$])(?:[\s\S]*?(?:(?=[\\<!\[`$*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
    );
    if (cap) {
      var text;
      if (inRawBlock) {
        text = this.options.sanitize
          ? this.options.sanitizer
            ? this.options.sanitizer(cap[0])
            : cap[0]
          : cap[0];
      } else {
        text = this.options.smartypants ? smartypants(cap[0]) : cap[0];
      }
      return {
        type: "text",
        raw: cap[0],
        text: text,
      };
    }
  },
  fences(src) {
    const cap = src.match(
      /^ {0,3}(`{3,}|\${2,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`\$]* *(?:\n+|$)|$)/
    );
    if (cap) {
      return {
        type: "code",
        raw: cap[0],
        codeBlockStyle: "indented",
        lang: cap[1] === "```" ? cap[2] : "TeX",
        text: cap[3],
      };
    }
  },
};

marked.use({ renderer, tokenizer });

router.get("/write", (req, res) => {
  if (CheckAuth(req, res)) {
    res.render("write", {
      session: req.session,
      title: "Write",
      categories: req.categories,
    });
  }
});

router.post("/write", (req, res) => {
  if (CheckAuth(req, res)) {
    let category = req.database.escape(req.body.category);
    let title = req.database.escape(req.body.title);
    let body = req.database.escape(req.body.body);
    console.log(body);
    req.database.query(
      "INSERT INTO post (category, title, writtentime, body, views, replies)" +
        `VALUES (${category}, ${title}, '${moment().format()}', ${body}, 0, 0);`,
      (err, result) => {
        if (err) throw err;
        console.log(req.body);
        res.status(200).redirect(`/post/${result.insertId}`);
      }
    );
  }
});

router.post("/update", (req, res) => {
  if (CheckAuth(req, res)) {
    req.database.query(
      `SELECT * FROM POST WHERE id = ${req.body.id};`,
      (err, post) => {
        if (err) throw err;
        res.render("update", {
          session: req.session,
          title: post[0].title,
          _category: post[0].category,
          body: post[0].body,
          id: req.body.id,
          categories: req.categories,
        });
      }
    );
  }
});

router.post("/update/process", (req, res) => {
  if (CheckAuth(req, res)) {
    let category = req.database.escape(req.body.category);
    let title = req.database.escape(req.body.title);
    let body = req.database.escape(req.body.body);
    console.log(body);
    req.database.query(
      "UPDATE post " +
        `SET category = ${category}, title = ${title}, writtentime = '${moment().format()}',` +
        ` body = ${body} WHERE id = ${req.body.id};`,
      (err, result) => {
        if (err) throw err;
        console.log(result);
        res.status(200).redirect(`/post/${req.body.id}`);
      }
    );
  }
});

router.post("/delete", (req, res) => {
  if (CheckAuth(req, res)) {
    req.database.query(`DELETE FROM post WHERE id = ${req.body.id};`, (err) => {
      if (err) throw err;
      req.database.query(`DELETE FROM reply WHERE post_id = ${req.body.id};`);
      res.status(200).redirect("/");
    });
  }
});

router.post("/reply", (req, res) => {
  let nickname = req.database.escape(req.body.nickname);
  let body = req.database.escape(req.body.reply_body);
  console.log(nickname.length + "asdf");
  if (nickname === "''") {
    nickname = "'익명'";
  }
  bcrypt.hash(req.body.pwd, 10, (err, hash) => {
    if (err) throw err;
    req.database.query(
      `INSERT INTO REPLY (PWD, POST_ID, WRITTENTIME, NICKNAME, BODY) VALUES ("${hash}", ${
        req.body.id
      }, "${moment().format()}", ${nickname}, ${body});`,
      (e) => {
        if (e) throw e;
        req.database.query(
          `UPDATE post SET replies = replies + 1 WHERE id = ${req.body.id};`
        );
        res.status(200).redirect(`/post/${req.body.id}`);
      }
    );
  });
});

router.post("/delete-reply", (req, res) => {
  let id = req.body.id;
  if (req.session.nickname) {
    req.database.query(`DELETE FROM reply WHERE id = ${id};`, (err3) => {
      if (err3) throw err3;
      req.database.query(
        `UPDATE post SET replies = replies - 1 WHERE id = ${req.body.postId};`
      );
      res.status(200).redirect(`/post/${req.body.postId}`);
    });
  } else {
    let pwd = req.body.pwd;
    req.database.query(
      `SELECT id, pwd FROM REPLY WHERE ID=${id};`,
      (err, rows) => {
        if (err) throw err;
        bcrypt.compare(pwd, rows[0].pwd, (err2, result) => {
          if (err2) throw err2;
          if (result) {
            req.database.query(
              `DELETE FROM reply WHERE id = ${id};`,
              (err3) => {
                if (err3) throw err3;
                res.redirect(`/post/${req.body.postId}`);
              }
            );
          } else {
            res.redirect(`/post/${req.body.postId}`);
          }
        });
      }
    );
  }
});

CheckAuth = (req, res) => {
  if (req.session.nickname) {
    return true;
  } else {
    res.render("error", {
      message: "비정상적인 접근입니다.",
    });
    return false;
  }
};

router.get("/:id", (req, res) => {
  if (Number.isInteger(Number(req.params.id))) {
    Render(res, req, req.params.id);
  } else {
    res.send("비정상적인 접근입니다.");
  }
});

function Render(res, req, postId) {
  req.database.query(
    `SELECT * FROM POST WHERE id = ${postId};`,
    (err, post) => {
      if (err) {
        throw err;
      } else if (post.length === 0) {
        res.send("존재하지 않는 글입니다.");
        return;
      }
      if (!req.session.nickname) {
        req.database.query(
          `UPDATE post SET views = views + 1 WHERE id = ${postId};`
        );
        post[0].views++;
      }

      req.database.query(
        `SELECT id, post_id, writtentime, nickname, body FROM REPLY WHERE POST_ID = ${postId} ORDER BY WRITTENTIME;`,
        (err, replies) => {
          post[0].writtentime = moment(post[0].writtentime).format(
            "YYYY.MM.DD. HH:mm"
          );
          replies.map((e) => {
            if (moment(e.writtentime).date() === moment().date()) {
              e.writtentime = moment(e.writtentime).format("HH:mm");
            } else {
              e.writtentime = moment(e.writtentime).format("MM.DD");
            }
          });
          //console.log(marked.lexer(post[0].body));
          post[0].body = marked(post[0].body);
          res.status(200).render("post", {
            session: req.session,
            post: post[0],
            categories: req.categories,
            replies,
          });
        }
      );
    }
  );
}

module.exports = router;
