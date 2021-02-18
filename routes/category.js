const express = require('express');
const router = express.Router();
const postsPerIndex = 10;

router.get('/:name', (req, res) => {
    const category = req.params.name;
    const idx = req.query.idx || 0;

    req.database.query(
        `SELECT * FROM post join category on post.category=category.name WHERE url = '${category}'`,
        (err, rows) => {
            if (err) throw err;
            res.render('category', {
                session: req.session,
                posts: rows.slice(
                    idx * postsPerIndex,
                    idx * postsPerIndex + postsPerIndex
                ),
                selectedCategory: rows[0].name,
                categories: req.categories,
                maxIndex: Math.ceil(rows.length / postsPerIndex),
                currentIndex: idx,
            });
        }
    );
});

module.exports = router;
