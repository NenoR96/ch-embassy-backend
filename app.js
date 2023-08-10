const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');





const app = express();

// Passport Config
require('./config/passport')(passport);

mongoose.connect(config.database, { useNewUrlParser: true });
mongoose.connection.on('connected', () => {
  console.log('Connected to detabase: ' + config.database);
});
mongoose.connection.on('error', (err) => {
  console.log('Error with connection to db: ' + err);
});

app.use(bodyParser.json());

app.set('views', __dirname + '/display');
app.set('view engine', 'html');

//staticki direktorijum bice ./public
app.use(express.static(path.join(__dirname, 'display')));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

app.use(cors());
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/admin', require('./routes/users.js'));
app.use('/article', require('./routes/articles.js'));

app.get('**', (req, res) => {

  res.sendfile(__dirname + '/display/index.html');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));


