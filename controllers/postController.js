const { DateTime } = require('luxon');
const marked = require('../src/postProcessor');
const { executeIfAuthorized, ...common } = require('./common');

module.exports = {
    getWrite(req, res, next) {
        executeIfAuthorized(req, res, async (req, res) => {
            res.render('write', {
                session: req.session,
                title: 'Write',
                categories: req.categories,
            });
        });
    },

    async postWrite(req, res, next) {
        executeIfAuthorized(req, res, async (req, res) => {
            const query = {
                ...req.body,
                formattedBody: marked(req.body.body),
                tags: req.body.tags ? req.body.tags.split(',') : [],
            };
            const post = new req.db.Post(query);
            await common.trySaveDoc(post);
            common.redirect(res, `/post/${encodeURI(req.body.url)}`);
        });
    },

    async getUpdate(req, res, next) {
        executeIfAuthorized(req, res, async (req, res) => {
            const query = { _id: req.params.id };
            const post = await common.tryReadFromModel(req.db.Post, query);
            res.render('update', {
                session: req.session,
                post: post[0],
                id: req.params.id,
                categories: req.categories,
            });
        });
    },

    async postUpdate(req, res, next) {
        executeIfAuthorized(req, res, async (req, res) => {
            const tags = req.body.tags ? req.body.tags.split(',') : [];
            const filter = { _id: req.body.id };
            const doc = {
                ...req.body,
                formattedBody: marked(req.body.body),
                tags,
            };
            await common.tryUpdateDocFromModel(req.db.Post, filter, doc);
            common.redirect(res, `/post/${req.body.url || result.insertId}`);
        });
    },

    async delete(req, res, next) {
        executeIfAuthorized(req, res, async (req, res) => {
            await common.tryDeleteFromModel(req.db.Post, { _id: req.body.id });
            common.redirect(res, '/');
        });
    },

    async getPost(req, res, next) {
        const url = req.params.url;
        const post = await common.tryReadFromModel(req.db.Post, { url });

        if (post.length === 0) {
            res.status(404).render('error', {
                message: `The post "${url}" does not exist.`,
            });
            next();
        }
        if (!common.isAuthorized(req)) {
            await common.tryUpdateDocFromModel(
                req.db.Post,
                { url },
                { $inc: { views: 1 } }
            );
        }

        post[0].formattedTime = getFormattedTime(post[0].writtenTime);
        post[0].replies.forEach(formatDateTimeForReply);

        res.status(200).render('post', {
            session: req.session,
            post: post[0],
            categories: req.categories,
        });
    },
};

function formatDateTimeForReply(reply) {
    const date = DateTime.fromJSDate(reply.writtenTime);
    reply.formattedTime = getFormattedTimeForReply(date);
}

function getFormattedTimeForReply(date) {
    return date.day === DateTime.now().day
        ? date.toLocaleString(DateTime.TIME_SIMPLE) // 1:30 PM
        : date.toLocaleString({ month: '2-digit', day: '2-digit' }); // 10/14
}

function getFormattedTime(date) {
    return DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_SHORT); // 10/14/1983, 1:30 PM
}
