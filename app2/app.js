var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var filmRouter = require('./routes/films');
var filmInfoRouter = require('./routes/filmInfo');
var genreListRouter = require('./routes/genres');
var userInfoRouter = require('./routes/userInfo');
var predictRouter = require('./routes/predict');
var correlateRouter = require('./routes/personality_genre');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('indexFolder'))

app.use('/', indexRouter);
app.use('/films', filmRouter);
app.use('/filmInfo', filmInfoRouter);
app.use('/genres', genreListRouter);
app.use('/userInfo', userInfoRouter);
app.use('/predict', predictRouter);
app.use('/correlate', correlateRouter);

app.get('*', function(req, res) {
  res.redirect('/');
});


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
