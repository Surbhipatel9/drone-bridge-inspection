var http = require("http");
var express = require("express");
var passport = require("passport");
var flash = require("connect-flash");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var formidable = require("formidable");
var fs = require("fs");
var $ = require("jquery");
var db = require("./DB.js");
var fs = require("fs");
var pdf = require("html-pdf");
require("./passport")(passport);

const path = require("path");
const LocalStrategy = require("passport-local").Strategy;
const qs = require("qs");

var app = express();

app.set("view engine", "ejs");
app.set("views", "public/views");

app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist/"));
app.use(express.static("public"));

// Passport middleware.
app.use(
  require("cookie-session")({
    secret: "dryooisacoolguy",
    resave: false,
    saveUninitialized: false
  })
);

app.use(cookieParser());
// Body parser middleware.
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

// required for passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // use connect-flash for flash messages stored in session

db.init();

app.get("/", (req, res) => {
  if (req.session.passport) {
    res.redirect("/user");
  } else {
    res.render("login.ejs", {
      message: req.flash("loginMessage"),
      userinfo: false
    });
  }
  //if(req.session.passport)
  //console.log(req.session.passport.user)  //GET SESSION INFO FOR CURRENTLY LOGGED IN USER
});

app.get("/login", (req, res, passport) => {
  if (req.session.passport) {
    res.redirect("/user");
  } else {
    res.render("login.ejs", {
      message: req.flash("loginMessage"),
      userinfo: false
    });
  }
});

/*// LOCAL LOGIN ROUTE
app.get('/login', (req, res, passport) => {
  res.render('login.ejs', { message: req.flash('loginMessage') });
});*/

//LOCAL LOGIN POST ROUTE
//authenticate the login and redirect on success/failure and send failure message if needed
app.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/user",
    failureRedirect: "/login",
    failureFlash: true
  }),
  (res, req) => {}
);

// User route.
app.get("/user", (req, res) => {
  //if logged in
  if (req.session.passport) {
    db.getReports(function(reports) {
      //get userinfo and send to the web page
      res.render(__dirname + "/public/views/user.ejs", {
        userinfo: JSON.stringify(req.session.passport.user),
        reports
      });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    db.getReports(function(reports) {
      res.render(__dirname + "/public/views/login.ejs", {
        message: req.flash("loginMessage"),
        userinfo: false,
        userinfo: false,
        reports
      });
    });
  }
});

app.post("/user", function(req, res) {
  function first() {
    var form = new formidable.IncomingForm();

    form.parse(req);

    var userinfo = JSON.stringify(req.session.passport.user);
    var userID = JSON.parse(userinfo).userID;

    form.on("fileBegin", function(name, file) {
      file.path = __dirname + "/public/pictures/" + file.name;
      db.updProfPic(userID, "/pictures/" + file.name).then(function(result) {});
    });

    form.on("file", function(name, file) {
      console.log("Uploaded " + file.name);
    });
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve("Done");
      }, 50);
    });
  }
  first().then(function() {
    if (req.session.passport) {
      db.checkLogin(req.session.passport.user.userName, function(user) {
        db.getUserInfo(req.session.passport.user.userName, function(userInf) {
          if (user) {
            var userinfo = {
              userName: userInf[0].userName,
              firstName: userInf[0].firstName,
              lastName: userInf[0].lastName,
              email: userInf[0].email,
              phone: userInf[0].phone,
              role: userInf[0].roleName,
              county: userInf[0].countyName,
              userID: user.userID,
              profPic: userInf[0].location
            };
          }
          req.login(userinfo, function(err) {
            if (err) return next(err);
          });
          res.redirect("/user");
        });
      });
    }
    //if not logged in send blank userinfo to web app
    else {
      res.redirect("/");
    }
  });
});

app.get("/header", (req, res) => {
  if (req.session.passport) {
    var reportID = req.query["reportID"];
    db.getReport(parseInt(parseInt(req.query["reportID"])), function(rep) {
      //get userinfo and send to the web page
      res.render(__dirname + "/public/views/header.ejs", {
        userinfo: JSON.stringify(req.session.passport.user),
        rep
      });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    res.render(__dirname + "/public/views/login.ejs", {
      message: req.flash("loginMessage"),
      userinfo: false
    });
  }
});

app.get("/report", (req, res) => {
  if (req.session.passport) {
    var reportID = req.query["reportID"];
    if (reportID) {
      db.getReport(reportID, function(rep) {
        db.getPhotos(reportID, function(photos) {
          db.getLatestPhotoId(function(lastId) {
            //get userinfo and send to the web page
            res.render(__dirname + "/public/views/report.ejs", {
              userinfo: JSON.stringify(req.session.passport.user),
              rep,
              photos,
              lastId
            });
          });
        });
      });
    } else {
      res.redirect("/user");
    }
  }
  //if not logged in send blank userinfo to web app
  else {
    var reportID = req.query["reportID"];
    res.render(__dirname + "/public/views/login.ejs", {
      message: req.flash("loginMessage"),
      userinfo: false
    });
  }
});

app.post("/report", (req, res) => {
  var inputValue = req.body.vote;
  reportId = req.body.repId;
  var data = req.body;
  console.log("data");
  var repId = data["repId"][0];
  var userId = data["userId"][0];
  function first() {
    if (inputValue == "finalize") {
      db.finalizeReport(reportId);
    }
    if (data["numOfItems"] == 1) {
      var i = -1;
      if (data["id"].replace(/\d+/g, "") == "oldremove") {
        db.removeItem(i, reportId, data);
      }
      if (data["id"].replace(/\d+/g, "") == "old") {
        db.updatePhotos(i, data);
      }
    }
    if (data["numOfItems"] == 0) {
    } else {
      for (var i = 0; i < data["id"].length; i++) {
        if (data["id"][i].replace(/\d+/g, "") == "oldremove") {
          db.removeItem(i, reportId, data);
        }
        if (data["id"][i].replace(/\d+/g, "") == "old") {
          db.updatePhotos(i, data);
        }
      }
    }
    //wait until items are processed(wow, a promise)
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve("Done");
      }, 1000);
    });
  }
  //process items further
  function second() {
    if (data["numOfItems"] == 1) {
      if (data["id"].replace(/\d+/g, "") == "old") {
        var i = -1;
        db.updateOrder(i, data["id"], reportId);
      }
    }
    if (data["numOfItems"] == 0) {
    } else {
      for (var i = 0; i < data["id"].length; i++) {
        if (data["id"][i].replace(/\d+/g, "") == "old") {
          db.updateOrder(i, data["id"][i], reportId);
        }
      }
    }
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve("Done");
      }, 1000);
    });
  }
  first()
    .then(second())
    .then(function() {
      if (inputValue == "buffer") {
        res.redirect("/buffer" + "?reportID=" + reportId);
      } else {
        //redirect
        if (req.session.passport) {
          res.redirect("/user");
        } else {
          //if not logged in send blank userinfo to web app
          res.redirect("/");
        } // respond back to request
      }
    });
});

app.get("/submit", (req, res) => {
  if (req.session.passport) {
    var reportID = req.query["reportID"];

    db.getFinalReports(reportID, function(rep) {
      //get userinfo and send to the web page
      res.render(__dirname + "/public/views/submitted_report.ejs", {
        userinfo: JSON.stringify(req.session.passport.user),
        rep
      });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    res.render(__dirname + "/public/views/login.ejs", {
      message: req.flash("loginMessage"),
      userinfo: false
    });
  }
});

app.get("/edit_photo", (req, res) => {
  if (req.session.passport) {
    var photoID = req.query["photoID"];

    db.getIndPhotos(photoID, function(photos) {
      //get userinfo and send to the web page
      res.render(__dirname + "/public/views/edit_photo.ejs", {
        userinfo: JSON.stringify(req.session.passport.user),
        photos
      });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    res.render(__dirname + "/public/views/login.ejs", {
      message: req.flash("loginMessage"),
      userinfo: false
    });
  }
});

app.post("/edit_photo", (req, res) => {
  if (req.session.passport) {
    var id = req.body.photoID;
    var title = req.body.title;
    var desc = req.body.description;
    var check = req.body.check;
    var photoID = req.query["photoID"];
    if (check) {
      db.updateCheckedPhotos(id, title, desc, function(photos) {
        res.redirect("/buffer");
      });
    }

    db.updatePhotos(id, title, desc, function(photos) {
      res.redirect("/buffer");
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    res.render(__dirname + "/public/views/login.ejs", {
      message: req.flash("loginMessage"),
      userinfo: false
    });
  }
});

app.get("/buffer", (req, res) => {
  //if logged in
  if (req.session.passport) {
    var showButton = false;
    var reportID = req.query["reportID"];
    if (reportID) {
      showButton = true;
    }
    db.getPhoto(req.session.passport.user.userID, function(photos) {
      //get userinfo and send to the web page
      res.render(__dirname + "/public/views/buffer.ejs", {
        userinfo: JSON.stringify(req.session.passport.user),
        photos,
        reportID,
        showButton
      });
    });
  }
  //if not logged in send blank userinfo to web app
  else {
    res.render(__dirname + "/public/views/login.ejs", {
      message: req.flash("loginMessage"),
      userinfo: false
    });
  }
});

app.post("/buffer", (req, res) => {
  var data = req.body;
  function first() {
    var reportId = req.body.reportID;
    db.getLatestOrder(reportId, function(order) {
      if (data["photoID"]) {
        if (data["itemNum"] == 1) {
          var i = -1;
          db.addReportId(i, reportId, data);
          db.insertIntoReportItems(i, order, reportId, data);
        }
        if (data["itemNum"] == 1) {
        } else {
          for (var i = 0; i < data["photoID"].length; i++) {
            if (data["include"][i] == "1") {
              db.addReportId(i, reportId, data);
              db.insertIntoReportItems(i, order, reportId, data);
              order++;
            }
          }
        }
      }
    });
    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        resolve("Done");
      }, 1000);
    });
  }
  first().then(function() {
    res.redirect("/report?reportID=" + reportId);
  });
});

app.post("/upload", (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    fs.readFile(files.reportFile.path, "ascii", function(err, data) {
      if (err) throw err;
      // data will contain your file contents
      var queries = data.split("\r\n");
      for (var i = 0; i < queries.length; i++) {
        db.insertQueries(queries[i]);
      }

      // delete file
      fs.unlink(files.reportFile.path, function(err) {
        if (err) throw err;
        console.log("successfully deleted " + files.reportFile.path);
      });
    });
  });
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/"); //Inside a callback… bulletproof!
});

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();

  // if they aren't redirect them to the home page
  res.redirect("/");
}

app.listen(process.env.PORT || 5000);

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
