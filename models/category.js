const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema();

categorySchema.add({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    subCategory: [categorySchema],
});

module.exports = categorySchema;
