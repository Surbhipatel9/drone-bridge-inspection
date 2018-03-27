var LocalStrategy = require('passport-local').Strategy;
var db = require('./DB.js');
var bcrypt = require('bcrypt');

module.exports = function (passport) {


  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    db.getUserInfo(user.userName, function (user) {
      return done(null, user);
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
        db.getUserInfo(username, function (userInf) {
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
            }
            console.log(userinfo);
          }
          if (!user) {
            return done(null, false, req.flash('loginMessage', 'No user found.'))
          }
          if (!bcrypt.compareSync(password, user.passwordHash)) {
            return done(null, false, req.flash('loginMessage', 'Oops! Wrong password!'));
          };
          return done(null, userinfo);
        })
      })
    }));
}