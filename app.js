const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const ConnectMongodbSession = require('connect-mongodb-session')
const mongodbSession = new ConnectMongodbSession(session)
const dotenv = require('dotenv')
const connectDB = require('./models/atlasConnection')
const multer = require ('multer')


const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');



const dataBase = require('./models/connection')
const app = express();
dotenv.config()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts)

app.use(logger('dev'));
app.use(express.json());

// session
app.use(session({
  saveUninitialized: false,
  secret: 'sessionSecret',
  resave: false,
  store: new mongodbSession({
    uri: "mongodb://localhost:27017/E-Commerce",
    collection: "session"
  }),
  cookie: {
    maxAge: 1000 * 60 * 24 * 10,//10 days
  },
}))



app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "public/admin-assets")));

app.use('/', userRouter);
app.use('/admin', adminRouter);



const start = function () {
  try {
    connectDB(process.env.MONGO_URL)
  }
  catch (err) {
    console.log(err);
  }
}
start() 

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
