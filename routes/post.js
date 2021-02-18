const express = require('express');
const moment = require('moment');
const { render } = require('../app');
const { ifError } = require('assert');
const bcrypt = require('bcrypt');
const { info } = require('console');
const router = express.Router();

router.get('/write', (req, res) => {
    if (checkAuth(req, res)) {
        res.render('write', {
            session: req.session,
            title: 'Write',
            categories: req.categories,
        });
    }
});

router.post('/write', (req, res) => {
    if (checkAuth(req, res)) {
        updatePost(req, res, null, (title, category, body) => {
            return `INSERT INTO post (category, title, writtentime, body, views, replies)
        VALUES (${category}, ${title}, '${moment().format()}', ${body}, 0, 0);`;
        });
    }
});

router.post('/update/process', (req, res) => {
    if (checkAuth(req, res)) {
        updatePost(req, res, req.body.id, (title, category, body) => {
            return `UPDATE post SET category = ${category}, title = ${title}, writtentime = 
        '${moment().format()}', body = ${body} WHERE id = ${req.body.id};`;
        });
    }
});

function updatePost(req, res, id, query) {
    let title = req.database.escape(req.body.title);
    let category = req.database.escape(req.body.category);
    let body = req.database.escape(req.body.body);
    req.database.query(query(title, category, body), (err, result) => {
        if (err) throw err;
        res.status(200).redirect(`/post/${id || result.insertId}`);
    });
}

router.post('/update', (req, res) => {
    if (checkAuth(req, res)) {
        req.database.query(
            `SELECT * FROM POST WHERE id = ${req.body.id};`,
            (err, post) => {
                if (err) throw err;
                res.render('update', {
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

router.post('/delete', (req, res) => {
    if (checkAuth(req, res)) {
        req.database.query(
            `DELETE FROM post WHERE id = ${req.body.id};`,
            (err) => {
                if (err) throw err;
                req.database.query(
                    `DELETE FROM reply WHERE post_id = ${req.body.id};`
                );
                res.status(200).redirect('/');
            }
        );
    }
});

router.post('/reply', (req, res) => {
    let nickname = req.database.escape(req.body.nickname);
    let body = req.database.escape(req.body.reply_body);
    if (nickname === "''") {
        nickname = "'익명'";
    }
    bcrypt.hash(req.body.pwd, 10, (err, hash) => {
        if (err) throw err;
        req.database.query(
            `INSERT INTO REPLY (PWD, POST_ID, WRITTENTIME, NICKNAME, BODY) 
      VALUES ("${hash}", ${req.body.id}, "${moment().format()}", 
      ${nickname}, ${body});`,
            (err) => {
                if (err) throw err;
                req.database.query(
                    `UPDATE post SET replies = replies + 1 WHERE id = ${req.body.id};`
                );
                res.status(200).redirect(`/post/${req.body.id}`);
            }
        );
    });
});

router.post('/delete-reply', (req, res) => {
    let id = req.body.id;
    if (req.session.nickname) {
        req.database.query(`DELETE FROM reply WHERE id = ${id};`, (err) => {
            if (err) throw err;
            req.database.query(
                `UPDATE post SET replies = replies - 1 WHERE id = ${req.body.postId};`
            );
            res.status(200).redirect(`/post/${req.body.postId}`);
        });
    } else {
        req.database.query(
            `SELECT id, pwd FROM REPLY WHERE ID=${id};`,
            (err, rows) => verifyPassword(err, rows, req, res)
        );
    }
});

function verifyPassword(err, rows, req, res) {
    if (err) throw err;
    bcrypt.compare(req.body.pwd, rows[0].pwd, (err, result) => {
        if (err) throw err;
        if (result) {
            req.database.query(
                `DELETE FROM reply WHERE id = ${req.body.id};`,
                (err) => {
                    if (err) throw err;
                    req.database.query(
                        `UPDATE post SET replies = replies - 1 WHERE id = ${req.body.postId};`
                    );
                    res.redirect(`/post/${req.body.postId}`);
                }
            );
        } else {
            res.redirect(`/post/${req.body.postId}`);
        }
    });
}

function checkAuth(req, res) {
    if (req.session.nickname) {
        return true;
    } else {
        res.render('error', {
            message: '비정상적인 접근입니다.',
        });
        return false;
    }
}

router.get('/:id', (req, res) => {
    if (Number.isInteger(Number(req.params.id))) {
        renderPost(req, res);
    } else {
        res.send('비정상적인 접근입니다.');
    }
});

function renderPost(req, res) {
    let postId = req.params.id;
    req.database.query(
        `SELECT * FROM POST WHERE id = ${postId};`,
        (err, post) => {
            if (err) {
                throw err;
            } else if (post.length === 0) {
                res.send('존재하지 않는 글입니다.');
                return;
            }
            post = post[0];
            // Increment views if not me
            if (!req.session.nickname) {
                req.database.query(
                    `UPDATE post SET views = views + 1 WHERE id = ${postId};`
                );
                post.views++;
            }

            loadReplies(req, res, post, postId);
        }
    );
}

function loadReplies(req, res, post, postId) {
    req.database.query(
        `SELECT id, post_id, writtentime, nickname, body FROM REPLY WHERE POST_ID = ${postId} ORDER BY WRITTENTIME;`,
        (err, replies) => {
            if (err) throw err;
            post.writtentime = moment(post.writtentime).format(
                'YYYY.MM.DD. HH:mm'
            );
            replies.map((e) => {
                e.writtentime =
                    moment(e.writtentime).date() === moment().date()
                        ? moment(e.writtentime).format('HH:mm')
                        : moment(e.writtentime).format('MM.DD');
            });
            let marked = require('./postProcessor');
            post.body = marked(post.body);
            res.status(200).render('post', {
                session: req.session,
                post,
                categories: req.categories,
                replies,
            });
        }
    );
}

module.exports = router;
