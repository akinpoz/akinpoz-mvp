const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv');
dotenv.config();


const db = process.env.MONGOURI
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB Connected')
}).catch(e => {
  console.error(e)
})

const app = express();
app.use(fileUpload())

app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/build')));

app.use(cors())

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/build/index.html'))
})

app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/locations', require('./routes/api/locations'))
app.use('/api/spotify', require('./routes/api/spotify'))
app.use('/api/campaigns', require('./routes/api/campaigns'))
app.use('/api/stripe', require('./routes/api/stripe'))

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
  res.json({ error: err.message })
});

module.exports = app;
