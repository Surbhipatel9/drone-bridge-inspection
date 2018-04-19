var http = require('http');
var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var $ = require('jquery');
var db = require('./DB.js');
var fs = require('fs');
var pdf = require('html-pdf');
require('./passport')(passport);

const path = require('path');
const LocalStrategy = require('passport-local').Strategy;
const qs = require('qs');

var app = express();

app.set('view engine', 'ejs')
app.set('views', 'public/views')

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
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

db.init();

app.get('/', (req, res) => {
  res.render('login.ejs', { message: req.flash('loginMessage'), userinfo: false });
  //if(req.session.passport)
  //console.log(req.session.passport.user)  //GET SESSION INFO FOR CURRENTLY LOGGED IN USER
})

app.get('/login', (req, res, passport) => {
  res.render('login.ejs', { message: req.flash('loginMessage'), userinfo: false });
})

/*// LOCAL LOGIN ROUTE
app.get('/login', (req, res, passport) => {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});*/

//LOCAL LOGIN POST ROUTE
//authenticate the login and redirect on success/failure and send failure message if needed
app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/user',
  failureRedirect: '/login',
  failureFlash: true
}), (res, req) => {
});

// User route.
app.get('/user', (req, res) => {
  //if logged in
  if (req.session.passport) {
    db.getReports(function (reports) {
      //get userinfo and send to the web page 
      res.render(__dirname + "/public/views/user.ejs", { userinfo: JSON.stringify(req.session.passport.user), reports });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    db.getReports(function (reports) {
      res.render(__dirname + "/public/views/login.ejs", { message: req.flash('loginMessage'), userinfo: false, userinfo: false, reports });
    });
  }

});

app.post('/user', function (req, res) {
  var form = new formidable.IncomingForm();

  form.parse(req);

  var userinfo = JSON.stringify(req.session.passport.user)
  var userID = JSON.parse(userinfo).userID

  form.on('fileBegin', function (name, file) {
    file.path = __dirname + '/public/pictures/' + file.name;
    db.updProfPic(userID, '/pictures/' + file.name).then(function (result) {

    });
  });


  form.on('file', function (name, file) {
    console.log('Uploaded ' + file.name);
  });
  if (req.session.passport) {
    db.getReports(function (reports) {
      //get userinfo and send to the web page 
      res.render(__dirname + "/public/views/report.ejs", { userinfo: JSON.stringify(req.session.passport.user), reports });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    db.getReports(function (reports) {
      res.render(__dirname + "/public/views/report.ejs", { message: req.flash('loginMessage'), userinfo: false, reports });
    });
  }
});

app.get('/header', (req, res) => {
  if (req.session.passport) {
    var reportID = req.query['reportID'];
    db.getReport(reportID, function (rep) {
      //get userinfo and send to the web page 
      res.render(__dirname + "/public/views/header.ejs", { userinfo: JSON.stringify(req.session.passport.user), rep });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    res.render(__dirname + "/public/views/login.ejs", { message: req.flash('loginMessage'), userinfo: false });
  }
});

app.post('/header', function (req, res) {
  var htmlPath = req.body.htmlPath;
  if (!htmlPath) {
    res.status(400).send("Missing 'htmlPath'");
    return;
  }
  var html = fs.readFileSync(htmlPath, 'utf8');
  // you may want to change this path dynamically if you also wish to keep the generated PDFs
  var pdfFilePath = './header.pdf';
  var options = { format: 'Letter' };

  pdf.create(html, options).toFile(pdfFilePath, function (err, res2) {
    if (err) {
      console.log(err);
      res.status(500).send("Some kind of error...");
      return;
    }
    fs.readFile(pdfFilePath, function (err, data) {
      res.contentType("application/pdf");
      res.send(data);
    });
  });
});

app.get('/report', (req, res) => {
  if (req.session.passport) {
    var reportID = req.query['reportID'];

    db.getReport(reportID, function (rep) {
      //get userinfo and send to the web page 
      res.render(__dirname + "/public/views/report.ejs", { userinfo: JSON.stringify(req.session.passport.user), rep });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    res.render(__dirname + "/public/views/login.ejs", { message: req.flash('loginMessage'), userinfo: false });
  }
});

app.get('/buffer', (req, res) => {
  //if logged in
  if (req.session.passport) {
    db.getPhoto(function (photos) {
      //get userinfo and send to the web page 
      res.render(__dirname + "/public/views/buffer.ejs", { userinfo: JSON.stringify(req.session.passport.user), photos });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    db.getPhoto(function (photos) {
      res.render(__dirname + "/public/views/login.ejs", { message: req.flash('loginMessage'), userinfo: false, userinfo: false, photos });
    });
  }

});

app.get('/test_file', (req, res) => {
  //if logged in
  if (req.session.passport) {
    db.getSelectedPhotos(function (photos) {
      //get userinfo and send to the web page 
      res.render(__dirname + "/public/views/test_file.ejs", { userinfo: JSON.stringify(req.session.passport.user), photos });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    db.getPhoto(function (photos) {
      res.render(__dirname + "/public/views/login.ejs", { message: req.flash('loginMessage'), userinfo: false, userinfo: false, photos });
    });
  }

});

app.post('/buffer', (req, res) => {
  //if logged in
  var photoID = req.body.photoID;
  var rowID = req.body.rowID;
  var check = req.body.check;


  if (req.session.passport) {
    if (check) {
      db.changeToTrue(photoID, function (photos) {
        res.send(photoID);
        console.log(photoID);
        res.redirect("/test_file");
      });
      console.log(check);
      //console.log(photoID);
    }
    //else if (req.body.uncheck) {
    // db.changeToFalse(function (photos) {
    //res.json(req.body.uncheck);
    //});
    //}
    //res.redirect("/test_file");
  }
});

app.get('/bridge_links', (req, res) => {
  //if logged in
  if (req.session.passport) {
    db.getBridgePhotos(function (photos) {
      //get userinfo and send to the web page 
      res.render(__dirname + "/public/views/bridge_links.ejs", { userinfo: JSON.stringify(req.session.passport.user), photos });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    db.getBridgePhotos(function (photos) {
      res.render(__dirname + "/public/views/login.ejs", { message: req.flash('loginMessage'), userinfo: false, userinfo: false, photos });
    });
  }

});

app.get('/logout', (req, res) => {
  req.logout()
  req.session.passport.user = false;
  res.redirect('/');
})

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