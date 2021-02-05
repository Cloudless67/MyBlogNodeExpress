const express = require("express");
const router = express.Router();

router.get("/:name", (req, res) => {
  let category = req.params.name;

  req.database.query(
    `SELECT * FROM post join category on post.category=category.name WHERE url = '${category}'`,
    (err, rows) => {
      if (err) throw err;
      console.log(rows);
      req.database.query(
        `SELECT * FROM category WHERE url = '${category}';`,
        (err, cat) => {
          if (err) throw err;
          console.log(rows);

          res.render("category", {
            session: req.session,
            posts: rows,
            selectedCategory: cat[0].name,
            categories: req.categories,
          });
        }
      );
    }
  );
});

module.exports = router;
