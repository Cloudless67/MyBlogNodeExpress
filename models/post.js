const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const replySchema = new mongoose.Schema();

replySchema.add({
    nickname: String,
    body: String,
    password: String,
    writtenTime: {
        type: Date,
        default: DateTime.now().toString(),
    },
    reReplies: [replySchema],
});

exports.Reply = mongoose.model('Reply', replySchema);

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        unique: true,
        default: this.title,
    },
    category: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    formattedBody: {
        type: String,
        required: true,
    },
    tags: [String],
    writtenTime: {
        type: Date,
        default: moment().format(),
    },
    views: {
        type: Number,
        default: 0,
    },
    replies: {
        type: [replySchema],
        default: [],
    },
    repliesNum: {
        type: Number,
        default: 0,
    },
});

exports.Post = mongoose.model('Post', postSchema);
