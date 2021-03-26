const { tryReadFromModel } = require('./common');
const maxPostsToShow = 10;

module.exports = {
    async getCategory(req, res, next) {
        const idx = req.query.idx || 0;
        const name = decodeURI(req.params.name);

        const categories = await tryReadFromModel(req.db.Category, { name });
        if (categories.length > 0) {
            posts = await tryReadFromModel(req.db.Post, {
                category: categories[0].name,
            });

            renderPostList(req, res, { title: categories[0].name, posts, idx });
        } else {
            res.render('error', { message: '존재하지 않는 카테고리입니다.' });
        }
    },

    async getTag(req, res, next) {
        const idx = req.query.idx || 0;
        const tag = decodeURI(req.params.tag);
        const posts = await tryReadFromModel(req.db.Post, { tags: tag });

        if (posts.length > 0) {
            renderPostList(req, res, { title: tag, posts, idx });
        } else {
            res.render('error', { message: '존재하지 않는 태그입니다.' });
        }
    },

    async getIndex(req, res, next) {
        const idx = req.query.idx || 0;
        const posts = await tryReadFromModel(req.db.Post, {});
        renderPostList(req, res, { title: '전체 글', posts, idx });
    },
};

function renderPostList(req, res, settings) {
    res.render('post-list', {
        session: req.session,
        posts: postsFromIndex(settings.posts, settings.idx),
        title: settings.title,
        categories: req.categories,
        maxIndex: Math.ceil(settings.posts.length / maxPostsToShow),
        currentIndex: settings.idx,
    });
}

function postsFromIndex(posts, idx) {
    return posts.slice(
        idx * maxPostsToShow,
        idx * maxPostsToShow + maxPostsToShow
    );
}
