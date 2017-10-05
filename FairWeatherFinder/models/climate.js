//require connection to database
const db = require('../db/setup');

//require packages
const axios = require('axios');
require('dotenv').config();
const passport = require('passport');
const auth = require('../services/auth');
const methodOverride = require('express-method-override');

//API keys
const googleApiKey = process.env.GAPI_KEY;
const darkSkiesApiKey = process.env.DSAPI_KEY;

//API URLs
const googleApiUrl = "https://maps.googleapis.com/maps/api/geocode/json";
const darkSkiesUrl = "https://api.darksky.net/forecast/";
const climate = {};

//Tims' numeric parameters checker -- thanks Tims!
function numericParam(reqParams, parameterName) {
    if (typeof parameterName !== 'string') {
        throw new Error('parameterName must be a string!')
    }
    const paramString = reqParams[parameterName];
    if (paramString === undefined) {
        throw new Error(parameterName + ' is undefined!');
    }
    const param = Number(paramString);
    if (isNaN(param)) {
        throw new Error('param is not a number! paramString: ' + paramString);
    }
    return param;
};


//PULL ALL EXISTENT PROFILES FROM THE DATABASE
climate.findAllProfiles = (req, res, next) => {
	db.manyOrNone(
		'SELECT * FROM profiles'
		).then(profiles => {
			res.locals.profiles = profiles;
			next();
		}).catch(err => {
			console.error(`error in climate.findAllProfiles: ${err}`)
		});	
};

//db call to get profile by name
climate.findProfileById = (req, res, next) => {
	const id = numericParam(req.params, "profileId");
	db.oneOrNone(
		'SELECT * FROM profiles WHERE id=$1', [id]
		).then(profile => {
			res.locals.profile = profile;
			next();
		}).catch(err => {
			console.error('error in the climate.findProfileById: ${err}')
		});
};

//PUT THE PROFILE FORM INTO THE PROFILE DATABASE
//RETURN profile ID
climate.createNewProfile = (req, res, next) => {
	const user_id = req.user.id,
			name = req.body.profileName,
			hiTemp = req.body.hiTemp,
			loTemp = req.body.loTemp,
			precip = req.body.precipitation,
			maxWind = req.body.windConditions,
			cloudCover = req.body.cloudConditions,
			humidity = req.body.humidity;
db.one(
	'INSERT INTO profiles (user_id, name, hiTemp, loTemp, precip, maxWind, cloudCover, humidity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning id', [user_id, name, hiTemp, loTemp, precip, maxWind, cloudCover, humidity]
	).then(newProfileData => {
		res.locals.newProfileData = newProfileData;
		next();
	}).catch(err => {
		console.error(`error in climate.createNewProfile: ${err}`)
	});
};
//Update an existing Profile
climate.editProfile = (req, res, next) => {
	const id = numericParam(req.params, "profileId"),
			hiTemp = req.body.hiTemp,
			loTemp = req.body.loTemp,
			precip = req.body.precipitation,
			maxWind = req.body.maxWind,
			cloudCover = req.body.cloudConditions,
			humidity = req.body.humidity;
db.one(
	'UPDATE profiles SET hiTemp = $1, loTemp = $2, precip = $3, maxWind = $4, cloudCover = $5, humidity = $6 WHERE id = $7 returning id', [hiTemp, loTemp, precip, maxWind, cloudCover, humidity, id]
	).then(editedProfileData => {
		res.locals.editedProfileData = editedProfileData;
		next();
	}).catch(err => {
		console.error(`error in climate.editProfile: ${err}`)
	});
};
//Remove a profile from the database
climate.delete = (req, res, next) => {
	const id = numericParam(req.params, "profileId");
	console.log('climate.delete firing')
    db.none(
        'DELETE FROM profiles WHERE id = $1', [id]
    ).then(() => {
        next();
    }).catch(err => {
    console.error(`error in climate.delete: ${err}`)

});
};
//convert address into lat/long using Google Maps API
climate.convertAddress = (req, res, next) => {
//axios call to ______ to convert a zipcode into a lat/long set
// const address = '';
// axios({
// 	url: `${googleApiUrl}?address=${address}&key=${googleApiKey}`,
// 	method: 'GET'
// }).then(addressData => {
// 	console.log(addressData);
// 	//FORMAT AND SEND ADDRESS DATA INTO climate.getWeatherData
// 	next();
// }).catch(err => {
//     console.error(`error in Message.saveUserInput: ${err}`)
// });
};
climate.getWeatherData = (req, res, next) => {
//axios call to DARK SKY API to retrieve a block of data
// const lat = '';
// const long = '';
// const date = '';
// axios({
// 	url: `${darkskiesUrl}${darkSkiesApiKey}/${lat},${long},${date}`,
// 	method: 'GET'
// }).then(weatherData => {
// 	console.log(weatherData);
// 	//FORMAT AND SEND RELEVANT DATA POINTS TO COMPARE WITH PROFILE
// 	next();
// })

};














module.exports = climate;