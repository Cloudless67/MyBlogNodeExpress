const Category = require('../schemas/category');

module.exports = async function (req, res, next) {
    const categories = await req.db.Category.find();

    req.categories = categories;
    next();
};
