const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
const MongoStore = require('connect-mongo').default;

let indexRouter = require('./routes/index');
let apiRouter = require('./routes/api');
let postRouter = require('./routes/post');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

// Set up default mongoose connection
const databaseURL = `mongodb+srv://${process.env.DB_USER}:${encodeURI(
    process.env.DB_PWD
)}@${
    process.env.DB_NAME
}.q6hi4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(databaseURL);
mongoose.connect(databaseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Get the default connection
const db = mongoose.connection;

// Check database connection
db.once('open', () => {
    console.log('Successfully connected to mongodb!');
});

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(
    session({
        key: 'LoginSession',
        secret: 'Secret',
        store: MongoStore.create({
            mongoUrl: databaseURL,
        }),
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

// Get categories
app.use(require('./middleware/navigationbar'));

app.use('/post', postRouter);
app.use('/api', apiRouter);
app.use('/', indexRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Sender the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
