var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var authRouter = require('./routes/auth');
var gachaRouter = require('./routes/character');
var rewardRouter = require('./routes/items');
var characterEquip = require('./routes/characterEquip');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/auth', authRouter);
app.use('/character', gachaRouter);
app.use('/item', rewardRouter);
app.use('/character/equip', characterEquip);

module.exports = app;
