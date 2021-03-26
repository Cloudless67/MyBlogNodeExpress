require('dotenv').config({ path: './config.env' });
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const Database = require('./models/database');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const postRouter = require('./routes/post');

const app = express();
const db = new Database();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// Parse application/json
app.use(express.json());

// Get corresponding database
app.use(require('./middleware/dbSelector')(db));

// Connect to Session
app.use(require('./middleware/session'));

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
