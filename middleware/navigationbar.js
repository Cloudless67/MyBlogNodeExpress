const Category = require('../models/category');

module.exports = async function (req, res, next) {
    const categories = await req.db.Category.find();

    req.categories = categories;
    next();
};
