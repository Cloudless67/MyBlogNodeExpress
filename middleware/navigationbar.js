const Category = require('../models/category');

module.exports = async function (req, res, next) {
    Category.find()
        .then((categories) => {
            req.categories = categories;
            next();
        })
        .catch((err) => console.error(err));
};
