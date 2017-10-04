//passport
const passport = require('passport');
//user model
const User = require('../models/user');
//local strategy for registration
const LocalStrategy = require('passport-local').Strategy;
//bcrypt authentication
const bcrypt = require('bcryptjs');

const authObject = {};

authObject.passportInstance = passport.initialize();
authObject.passportSession = passport.session();

authObject.restrict = function restrict(req, res, next) {
  console.log('in auth.restrict. req.isAuthenticated():', req.isAuthenticated());
  if (req.isAuthenticated()) {
    next();
  } else if (req.method === 'POST') {
    res.send('logged out');
  } else {
    res.redirect('/');
  }
}

//store user data client side
passport.serializeUser((user, done) => {
  console.log('in passport.serializeUser. user:', user);
  done(null, user);
});

// define othe user information
passport.deserializeUser((userObj, done) => {
  console.log('in passport.deserializeUser. userObj: ', userObj);
  User
    .findByEmail(userObj.email)
    .then(user => {
      done(null, user);
    })
    .catch(err => {
      console.log('ERROR in deserializeUser:', err);
      done(null, false);
    });
});

//authentication process for new user
passport.use(
  'local-signup',
  new LocalStrategy({
        usernameField: 'user[email]',
        passwordField: 'user[password]',
        passReqToCallback: true
    },
    (req, email, password, done) => {
      User
        .create(req.body.user)
        .then((user) => {
          return done(null, user);
        })
        .catch((err) => {
          console.log('ERROR:', err);
          return done(null, false);
        });
    })
);
//authentication process for logging in existing user
passport.use(
  'local-login',
  new LocalStrategy({
      usernameField: 'user[email]',
      passwordField: 'user[password]',
      passReqToCallback: true
  },
  (req, email, password, done) => {
    User
      .findByEmail(email)
      .then((user) => {
        if (user) {
          const isAuthed = bcrypt.compareSync(password, user.password_digest);
          console.log('isAuthed:', isAuthed);
          if (isAuthed) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        } else {
          return done(null, false);
        }
      });
  })
);


module.exports = authObject;