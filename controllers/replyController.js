const { executeIfAuthorized, ...common } = require('./common');

module.exports = {
    async postReply(req, res, next) {
        const hash = await common.tryHash(req.body.pwd);
        const reply = new req.db.Reply({
            nickname: req.body.nickname || '익명',
            body: req.body.body,
            password: hash,
        });
        const filter = { url: req.body.url };
        const doc = { $push: { replies: reply }, $inc: { repliesNum: 1 } };

        await common.tryUpdateDocFromModel(req.db.Post, filter, doc);
        common.redirect(res, `/post/${req.body.url}`);
    },

    async deleteReply(req, res, next) {
        if (common.isAuthorized(req)) {
            const filter = { url: req.body.url };
            const doc = {
                $pull: { replies: { _id: req.body.id } },
                $inc: { repliesNum: -1 },
            };
            await common.tryUpdateDocFromModel(req.db.Post, filter, doc);
            common.redirect(res, `/post/${req.body.url}`);
        } else {
            await deleteReplyByGuest(req, res);
        }
    },
};

async function deleteReplyByGuest(req, res) {
    const url = req.body.url;
    const _id = req.body.id;
    const post = await common.tryReadFromModel(req.db.Post, { url });
    const reply = post[0].replies.filter((x) => x._id == _id);
    const isPasswordCorrect = await common.tryComparePassword(
        req.body.pwd,
        reply[0].password
    );

    if (isPasswordCorrect) {
        const doc = {
            $pull: { replies: { _id } },
            $inc: { repliesNum: -1 },
        };
        await common.tryUpdateDocFromModel(req.db.Post, { url }, doc);
        common.redirect(res, `/post/${url}`);
    } else {
        common.redirect(res, `/post/${req.body.url}`);
    }
}
