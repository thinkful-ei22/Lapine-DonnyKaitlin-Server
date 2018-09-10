'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

//routers
const usersRouter = require('./routes/users');
const questionsRouter = require('./routes/questions');
const authRouter = require('./routes/auth');

const app = express();


app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// Parse request body
app.use(express.json());

// Utilize the given `strategy`
passport.use(localStrategy);
passport.use(jwtStrategy);


//Mount routers
app.use('/api/users', usersRouter);
app.use('/api/questions',questionsRouter);
app.use('/api',authRouter);

//Custom 404 not found handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
