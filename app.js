const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const logger = require('morgan');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const MySQLStore = require('express-mysql-session')(session);

var indexRouter = require('./routes/index');
var postRouter = require('./routes/post');
var categoryRouter = require('./routes/category');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// connect to mysql server
var mysqlConnection = require('./middleware/mysql')(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PWD, process.env.DB_NAME);
app.use((req, res, next) => {
  req.database = mysqlConnection;
  next();
});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

// create session store
var sessionStore = new MySQLStore({}, mysqlConnection);

// get categories
app.use(require('./middleware/navigationbar'));

app.use('/post', postRouter);
app.use('/category', categoryRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
