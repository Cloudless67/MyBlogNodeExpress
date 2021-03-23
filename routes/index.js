const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Post } = require('../schemas/post');
const Category = require('../schemas/category');
const maxPostsToShow = 10;

router.get('/login', (req, res) => {
    res.render('login', {
        session: req.session,
    });
});

router.post('/login', (req, res) => {
    if (req.body.id !== process.env.ID) {
        res.render('error', {
            message: '존재하지 않는 ID입니다.',
        });
        return;
    }
    bcrypt.compare(req.body.password, process.env.PASSWORD, (err, result) => {
        if (err) throw err;
        if (result) {
            req.session.nickname = req.body.id;
            req.session.save((err) => {
                if (err) throw err;
                res.redirect('/');
            });
        } else {
            res.render('error', {
                message: 'password가 일치하지 않습니다.',
            });
            return;
        }
    });
});

router.get('/logout', (req, res) => {
    delete req.session.nickname;
    req.session.save(() => {
        res.redirect('/');
    });
});

router.get('/category/:name', async (req, res) => {
    const idx = req.query.idx || 0;
    const name = decodeURI(req.params.name);
    try {
        const categories = await Category.find({ name });
        const result = await Post.find({ category: categories[0].name });

        res.render('post-list', {
            session: req.session,
            posts: result.slice(
                idx * maxPostsToShow,
                idx * maxPostsToShow + maxPostsToShow
            ),
            title: categories[0].name,
            categories: req.categories,
            maxIndex: Math.ceil(result.length / maxPostsToShow),
            currentIndex: idx,
        });
    } catch {
        res.render('error', {
            message: 'Wrong category.',
        });
    }
});

router.get('/tag/:tag', async (req, res) => {
    const idx = req.query.idx || 0;
    const tag = decodeURI(req.params.tag);
    let result = [];
    try {
        result = await Post.find({ tags: tag });
    } catch (error) {
        res.status(404).render('error', { message: error.message });
    }

    if (result.length <= 0) {
        res.render('error', { message: 'The tag does not exist.' });
        return;
    }

    res.render('post-list', {
        session: req.session,
        posts: result.slice(
            idx * maxPostsToShow,
            idx * maxPostsToShow + maxPostsToShow
        ),
        title: tag,
        categories: req.categories,
        maxIndex: Math.ceil(result.length / maxPostsToShow),
        currentIndex: idx,
    });
});

router.get('/', async (req, res) => {
    const idx = req.query.idx || 0;
    const result = await req.db.Post.find({});

    res.render('post-list', {
        session: req.session,
        posts: result.slice(
            idx * maxPostsToShow,
            idx * maxPostsToShow + maxPostsToShow
        ),
        title: '전체 글',
        categories: req.categories,
        maxIndex: Math.ceil(result.length / maxPostsToShow),
        currentIndex: idx,
    });
});

module.exports = router;
