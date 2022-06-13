const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');

require('./config/database')

const cors = require('cors');

const usersRouter = require('./app/routes/users');
const notesRouter = require('./app/routes/notes');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    "origin": "*",
    "methods": "GET,PUT,POST,DELETE",
    "optionsSuccessStatus": 200
}));

app.use('/users', usersRouter);
app.use('/notes', notesRouter);

module.exports = app;