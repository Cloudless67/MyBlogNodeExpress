const mongoose = require('mongoose');
const categorySchema = require('../schemas/category');
const postSchema = require('../schemas/post');
const replySchema = require('../schemas/reply');

mongoose.set('useCreateIndex', true);

module.exports = class DatabaseManager {
    constructor() {
        mongoose.connect(process.env.DB_URL + process.env.DB_DEFAULT, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        this.connection = mongoose.connection;

        this.connection.once('open', () => {
            console.log('Successfully connected to mongodb!');
        });

        this.connection.on(
            'error',
            console.error.bind(console, 'MongoDB connection error:')
        );

        this.updateModels();
    }

    updateModels() {
        this.Category = this.connection.model('Category', categorySchema);
        this.Post = this.connection.model('Post', postSchema);
        this.Reply = this.connection.model('Reply', replySchema);
    }

    changeDb(dbName) {
        this.connection = this.connection.useDb(dbName, { useCache: true });
        this.updateModels();
    }
};
