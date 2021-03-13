const express = require('express');
const { DateTime } = require('luxon');
const bcrypt = require('bcrypt');
const { Post, Reply } = require('../models/post');
const marked = require('./postProcessor');
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

router.post('/write', async (req, res) => {
    if (checkAuth(req, res)) {
        const post = new Post({
            ...req.body,
            formattedBody: marked(req.body.body),
            tags: req.body.tags ? req.body.tags.split(',') : [],
        });
        try {
            await post.save();
            res.status(200).redirect(
                `/post/${req.body.url || result.insertId}`
            );
        } catch (error) {
            res.status(400).render('error', { message: error.message });
        }
    }
});

router.get('/update/:id', async (req, res) => {
    if (checkAuth(req, res)) {
        try {
            const post = await Post.find({ _id: req.params.id });

            res.render('update', {
                session: req.session,
                post: post[0],
                id: req.params.id,
                categories: req.categories,
            });
        } catch (error) {
            res.status(400).render('error', { message: error.message });
        }
    }
});

router.post('/update', async (req, res) => {
    if (checkAuth(req, res)) {
        try {
            await Post.updateOne(
                { _id: req.body.id },
                {
                    ...req.body,
                    formattedBody: marked(req.body.body),
                    tags: req.body.tags ? req.body.tags.split(',') : [],
                }
            );

            res.status(200).redirect(
                `/post/${req.body.url || result.insertId}`
            );
        } catch (error) {
            res.status(400).render('error', { message: error.message });
        }
    }
});

router.post('/delete', async (req, res) => {
    if (checkAuth(req, res)) {
        try {
            await Post.deleteOne({ _id: req.body.id });
            res.status(200).redirect('/');
        } catch (error) {
            res.status(400).render('error', { message: error.message });
        }
    }
});

router.post('/reply', async (req, res) => {
    const hash = await bcrypt.hash(req.body.pwd, 10);
    try {
        const reply = new Reply({
            nickname: req.body.nickname || '익명',
            body: req.body.body,
            password: hash,
        });

        await Post.updateOne(
            { url: req.body.url },
            { $push: { replies: reply }, $inc: { repliesNum: 1 } }
        );

        res.status(200).redirect(`/post/${req.body.url}`);
    } catch (error) {
        res.status(400).render('error', { message: error.message });
    }
});

router.post('/delete-reply', async (req, res) => {
    const url = req.body.url;
    const _id = req.body.id;
    if (req.session.nickname) {
        try {
            await Post.updateOne(
                { url },
                { $pull: { replies: { _id } }, $inc: { repliesNum: -1 } }
            );
            res.status(200).redirect(`/post/${url}`);
        } catch (error) {
            res.status(400).render('error', { message: error.message });
        }
    } else {
        const post = await Post.find({ url });
        const reply = post[0].replies.filter((x) => x._id == _id);
        const result = await bcrypt.compare(req.body.pwd, reply[0].password);

        if (result) {
            try {
                await Post.updateOne(
                    { url },
                    {
                        $pull: { replies: { _id } },
                        $inc: { repliesNum: -1 },
                    }
                );
                res.status(200).redirect(`/post/${url}`);
            } catch (error) {
                res.status(400).render('error', { message: error.message });
            }
        } else {
            res.redirect(`/post/${req.body.url}`);
        }
    }
});

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

router.get('/:url', async (req, res) => {
    const url = req.params.url;

    const post = await Post.find({ url: url });
    if (post.length === 0) {
        res.status(404).render('error', {
            message: `The post "${url}" does not exist.`,
        });
        return;
    }
    if (!req.session.nickname) {
        await Post.updateOne({ url: url }, { $inc: { views: 1 } });
    }

    post[0].formattedTime = moment(post[0].writtenTime).format(
        'YYYY.MM.DD. HH:mm'
    );

    post[0].replies.forEach((e) => {
        const dt = DateTime.fromJSDate(e.writtenTime);
        e.formattedTime =
            dt.day === DateTime.now().day
                ? dt.toLocaleString(DateTime.TIME_SIMPLE)
                : dt.toLocaleString({ month: '2-digit', day: '2-digit' });
    });
    res.status(200).render('post', {
        session: req.session,
        post: post[0],
        categories: req.categories,
    });
});

module.exports = router;
