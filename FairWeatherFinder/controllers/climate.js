//profile models
const climate = require('../models/climate');
const user = require('../models/users');
//express route
const router = require('express').Router();
//auth setup
const passport = require('passport');
const auth = require('../services/auth');


//render welcome page with user profiles
router.get('/', 
	auth.restrict,
	climate.findAllProfiles,
	(req, res) => {
	res.render('climate/index');
});
//render new profile form
router.get('/profiles/new', 
	auth.restrict,
	(req, res) => {
	res.render('climate/profile');
	});
//post new profile to DB, return to index
router.post('/profiles/new', 
	auth.restrict,
	climate.createNewProfile,
	(req, res) => {
	res.render('climate/index');
	});
//select profile by id
router.get('/profiles/:profileId', 
	auth.restrict,
	climate.findProfileById,
	(req, res) => {
res.render('climate/profileDisplay');
	});
//render edit form
router.get('/profiles/:profileId/edit',
	auth.restrict,
	 (req, res) => {
	res.render('climate/edit', {id: req.params.profileId});
	});
//put profile updates into database
router.put('/profiles/:profileId/edit/',
	auth.restrict,
	climate.editProfile,
	(req, res) => {
	res.render('climate/index', res.locals.editedProfileData);
	});
//remove a profile from the database
router.delete('/profiles/:profileId',
	auth.restrict,
	climate.delete,
	(req, res) => {
		console.log("router.delete firing");
	res.render('climate/index');
	});


router.get('/profiles/:profileId/query', (req, res) => {
//REFORMAT ADDRESS DATA -- google api
res.render('climate/queryDate');
	});

router.get('/profiles/:profileId/query', (req, res) => {
//RETRIEVE WEATHER DATA -- dksky api
res.render('climate/result');
	});





module.exports = router;




