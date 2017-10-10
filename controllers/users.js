//user model
const User = require('../models/users');
//express route
const router = require('express').Router();
//auth setup
const passport = require('passport');
const auth = require('../services/auth');


//render new user sign-up
router.get('/new', (req, res) => {
  res.render('users/new');
});


//Create new user row in db
router.post('/new', passport.authenticate(
        'local-signup', {
            failureRedirect: '/new',
            successRedirect: '/climate'
        }
    )
);

// Post to login (params are username/password).
router.post('/login',
  passport.authenticate(
    'local-login', {
        failureRedirect: '/',
        successRedirect: '/climate'
    }
));

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});




module.exports = router;