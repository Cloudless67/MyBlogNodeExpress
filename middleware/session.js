const session = require('express-session');
const MongoStore = require('connect-mongo');

module.exports = session({
    key: 'LoginSession',
    secret: 'Secret',
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
    },
});
