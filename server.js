var http = require('http');
var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var db = require('./DB.js');
require('./passport')(passport);

const path = require('path');
const LocalStrategy = require('passport-local').Strategy;

var app = express();

app.set('view engine', 'ejs')
app.set('views', 'public/views')

app.use(express.static('public'))

// Passport middleware.
app.use(require('express-session')({
  secret: 'dryooisacoolguy',
  resave: false,
  saveUninitialized: false
}));

app.use(cookieParser());
// Body parser middleware.
app.use(bodyParser.json());			// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// required for passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session


app.get('/', (req, res) => {
  res.render('index.ejs')
  //if(req.session.passport)
  //console.log(req.session.passport.user)  //GET SESSION INFO FOR CURRENTLY LOGGED IN USER
})

// LOCAL LOGIN ROUTE
app.get('/login', (req, res, passport) => {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});

//LOCAL LOGIN POST ROUTE
//authenticate the login and redirect on success/failure and send failure message if needed
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}), (res, req) => {
});

app.get('/registration', (req, res, passport) => {
  res.render('registration.ejs', { message: req.flash('loginMessage') })
})

app.post('/registration', passport.authenticate('local-signup', {
  successRedirect: '/',
  failureRedirect: '/registration',
  failureFlash: true
}), (req, res) => { })

app.get('/logout', (req, res) => {
  req.logout()
  req.session.passport.user = false;
  res.redirect('/');
})

app.get('/user'/*, isLoggedIn*/, function (req, res) {
  res.render('user.ejs', {
    user: req.user // get the user out of session and pass to template
  });
});

function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated())
      return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

app.listen(8080)













/*
var http = require('http');
var fs = require('fs');
var express = require('express');
var app = express();
var passport = require('passport');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var db = require('./DB.js');
const path = require('path');
const LocalStrategy = require('passport-local').Strategy;
app.use(express.static('public'))

// Passport middleware.
app.use(require('express-session')({
	secret: 'dryooisacoolguy',
	resave: false,
	saveUninitialized: false
}));
app.set('view engine', 'ejs')
app.set('views', 'public')
app.use(cookieParser());
// Body parser middleware.
app.use(bodyParser.json());			// to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

// required for passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session
require('./passport')(passport);

app.get('/', (req,res) => {
  res.render('index.ejs')
  //if(req.session.passport)
    //console.log(req.session.passport.user)  //GET SESSION INFO FOR CURRENTLY LOGGED IN USER
})

// LOCAL LOGIN ROUTE
app.get('/login', (req, res, passport) => {
	res.render('login.ejs', {message: req.flash('loginMessage')});
});

//LOCAL LOGIN POST ROUTE
//authenticate the login and redirect on success/failure and send failure message if needed
app.post('/login', passport.authenticate('local-login', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}), (res, req) => {
});

app.get('/registration', (req,res,passport) => {
  res.render('registration.ejs', {message:req.flash('loginMessage')})
})

app.post('/registration', passport.authenticate('local-signup', {
  successRedirect:'/',
  failureRedirect:'/registration',
  failureFlash:true }), (req,res) => {})

app.get('/logout', (req,res) => {
  req.logout()
  req.session.passport.user = false;
  res.redirect('/');
})

/*
function fillHomeTable(str){
  var xhttp;
  if(str == ""){
    document.getElementById("txtHint").innerHTML = "";
    return;
  }
  xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
      document.getElementById("txtHint").innerHTML = 
      this.responseText;
  }
};
xhttp.open("GET", "index.ejs?q=" + str, true);
xhttp.send();
}

app.listen(8080)

express = require('express');
bodyParser = require('body-parser');
app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.send('Hello World');
});

app.listen(8080, function(){
  console.log('Server started on port 8080');
})


*/