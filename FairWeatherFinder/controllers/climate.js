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
	res.render('climate/index');
	});
//render first query form
router.get('/profiles/:profileId/query',
	(req, res) => {
		auth.restrict,
		res.render('climate/queryAdd', {id: req.params.profileId});
	});
//reformat address -- google api
router.post('/profiles/:profileId/query/', 
	auth.restrict,
	climate.convertAddresses,
	(req, res) => {
res.render('climate/queryDate');
	});
//render second query form
router.get('/profiles/:profileId/query/2',
	auth.restrict,
	(req, res) => {
	res.render('climate/queryDate', {id: req.params.profileId});
	});
//retrieve weather data -- dark skies api
router.post('/profiles/:profileId/query/2', 
	auth.restrict,
	climate.getWeatherData,
	(req, res) => {
res.render('climate/result');
});
//render delay page
router.get('/profiles/:profileId/results',
	auth.restrict,
	(req, res) => {
	res.render('climate/result', {
		id: req.params.profileId
	});
	});
//display average weather data for date range
router.get('/profiles/:profileId/results/1',
	auth.restrict,
	climate.getWeatherData,
	climate.filterWeatherData,
	(req, res) => {
	res.render('climate/returns', {
		id: req.params.profileId,
		results: res.locals.resultObject,
		counter: res.locals.counter,
		address: res.locals.address
		}
	);
	});




module.exports = router;




