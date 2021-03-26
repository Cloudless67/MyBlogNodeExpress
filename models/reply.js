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

module.exports = replySchema;
