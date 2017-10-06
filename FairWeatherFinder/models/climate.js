//require connection to database
const db = require('../db/setup');

//require packages
const axios = require('axios');
require('dotenv').config();
const passport = require('passport');
const auth = require('../services/auth');
const methodOverride = require('express-method-override');
const bodyParser = require('body-parser');
const moment = require('moment');

//API keys
const googleApiKey = process.env.GAPI_KEY;
const darkSkiesApiKey = process.env.DSAPI_KEY;

//API URLs
const googleApiUrl = "https://maps.googleapis.com/maps/api/geocode/json";
const darkSkiesUrl = "https://api.darksky.net/forecast/";
const climate = {};

//Global address variables
let lat = 0;
let long = 0;

//weather object to compare to profile
const weatherObject = {};

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
        maxWind = req.body.maxWind,
        cloudCover = req.body.cloudCover,
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
    console.log('firing inside climate.convertAddress');
    const address = req.body.address;
    axios({
        url: `${googleApiUrl}?address=${address}&key=${googleApiKey}`,
        method: 'GET'
    }).then(addressData => {
        const locationData = addressData.data.results[0].geometry.location;
        lat = locationData.lat;
        long = locationData.lng;
        console.log('lat: ', lat);
        console.log('long: ', long);
        next();
    }).catch(err => {
        console.error(`error in climate.convertAddress: ${err}`)
    });
};
//axios call to DARK SKY API to retrieve a block of data
climate.getWeatherData = (req, res, next) => {
		const startDate = req.body.startDate;
    const unixDate = moment(`${startDate} 12:00`, "YYYY/M/D H:mm").unix();
        axios({
            url: `${darkSkiesUrl}${darkSkiesApiKey}/${lat},${long},${unixDate}`,
            method: 'GET'
        }).then(weatherData => {
            const dailyData = weatherData.data.daily.data[0];
            weatherObject.hiTemp = dailyData.temperatureMax;
            weatherObject.loTemp = dailyData.temperatureMin;
            weatherObject.precip = dailyData.precipIntensityMax;
            weatherObject.maxWind = dailyData.windSpeed;
            weatherObject.humidity = dailyData.humidity;
            weatherObject.cloudCover = dailyData.cloudCover;
            weatherObject.icon = dailyData.icon;
            console.log(weatherObject);
            next();
        }).catch(err => {
            console.error(`error in climate.getWeatherData: ${err}`)
        });
    };














module.exports = climate;