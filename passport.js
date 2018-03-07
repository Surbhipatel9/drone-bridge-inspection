var LocalStrategy = require('passport-local').Strategy;
var db = require('./DB.js');
var bcrypt = require('bcrypt');

module.exports = function (passport) {

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    db.getUserInfo(user.userName, function (user2) {
      return done(null, user2);
    });
  });

  passport.use('local-login', new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
    passReqToCallback: true
  },
    function (req, username, password, done) {
      var pass = bcrypt.hashSync(password, 8);
      db.checkLogin(username, function (user) {
        if (user) {
          var userinfo = {
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            userID: user.userID
          }
        }
        if (!user) {
          return done(null, false, req.flash('loginMessage', 'No user found.'))
        }
        if (!bcrypt.compareSync(password, user.passwordHash)) {
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password!'));
        };
        return done(null, userinfo);
      })
    }));

  // passport.use('local-signup', new LocalStrategy({
  //   usernameField: 'username',
  //   passwordField: 'password',
  //   passReqToCallback: true
  // },
  //   function (req, username, password, firstname, lastname, done) {
  //     process.nextTick(function () {
  //       db.checkLogin(username, function (user) {
  //         if (err)
  //           return done(err);
  //         if (user) {
  //           return done(null, false, req.flash('signupMessage', 'That UserName is already taken.'));
  //         } else {
  //           db.addUser(username, password, firstname, lastname, function (err) {
  //             if (err)
  //               throw err;
  //             return done(null, userInfo)
  //           })
  //         }
  //       })
  //     })
  //   }))

  //   passport.use('local-signup', new LocalStrategy({
  //     // // by default, local strategy uses username and password, we will override with email
  //     // usernameField : 'userName',
  //     // passwordField : 'password',
  //     passReqToCallback : true // allows us to pass back the entire request to the callback
  // },
  // function(req, _userName, _password, _firstName, _lastName, done) {
  //     //console.log('here');
  //     // find a user whose email is the same as the forms email
  //     // we are checking to see if the user trying to login already exists
  //     db.checkLogin(_userName, function(user){
  //         if(user)
  //             return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
  //         else{
  //             var newUser = {
  //                 userName: _userName,
  //                 password: bcrypt.hashSync(_password, 8),
  //                 firstName: _firstName,
  //                 lastName: _lastName,
  //                 districtID: 0,
  //                 countyID: 0,
  //                 isActive: true
  //             };
  //             db.addUser(newUser, function(userid){
  //                 return done(null, newUser)
  //             })
  //         }
  //     })
  // }));
};