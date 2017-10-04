//user model
const User = require('../models/users');
//express route
const router = require('express').Router();
//auth setup
const passport = require('passport');
const auth = require('../services/auth');


//Create new user row
router.post('/', passport.authenticate(
        'local-signup', {
            failureRedirect: '/users/new',
            successRedirect: '/auth'
        }
    )
);

//register new user
router.get('/new', (req, res) => {
  res.render('users/new');
});

// Post to login (params are username/password).
router.post('/login',
  passport.authenticate(
    'local-login', {
        failureRedirect: '/',
        successRedirect: '/auth'
    }
));

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});




module.exports = router;