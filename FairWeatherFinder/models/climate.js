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

//weather arrray and results object to compare to profile
const weatherArray = [];
const resultObject = {};

//generic average function
average = (array) => {
	let arrSum = array.reduce((sum, value) => {
		return sum + value; 
	}, 0);
	return arrSum/array.length;
};
//Tims' numeric parameters checker -- thanks Tims!
numericParam = (reqParams, parameterName) => {
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
//find all profiles to populate user page
climate.findAllProfiles = (req, res, next) => {
	const user_id = req.user.id;
    db.manyOrNone(
        'SELECT * FROM profiles WHERE user_id = $1', [user_id]
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
        console.error(`error in the climate.findProfileById: ${err}`)
    });
};
//create new profile in database
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
    const endDate = req.body.endDate;
    const numericStartDate = moment(`${startDate} 12:00`, "YYYY/M/D H:mm").format('DDD');
    const numericEndDate = moment(`${endDate} 12:00`, "YYYY/M/D H:mm").format('DDD');
    const unixStartDate = moment(`${startDate} 12:00`, "YYYY/M/D H:mm").unix();
    const callLength = numericEndDate - numericStartDate;
    console.log('NSD', numericStartDate, 'USD', unixStartDate, 'CL', callLength);

    let weatherPromises = [];

    for (let i = 0; i < callLength; i++) {
        let unixDate = unixStartDate + i * 84600;
        weatherPromises.push(
            axios({
                url: `${darkSkiesUrl}${darkSkiesApiKey}/${lat},${long},${unixDate}`,
                method: 'GET'
            })
        );
    };

    axios.all(weatherPromises).then(results => {
    	results.forEach(response => {
        	weatherObject = {};
            const dailyData = response.data.daily.data[0];
            weatherObject.hiTemp = dailyData.temperatureMax;
            weatherObject.loTemp = dailyData.temperatureMin;
            weatherObject.precip = dailyData.precipIntensityMax;
            weatherObject.maxWind = dailyData.windSpeed;
            weatherObject.humidity = dailyData.humidity;
            weatherObject.cloudCover = dailyData.cloudCover;
            weatherObject.icon = dailyData.icon;
            console.log(weatherObject);
            weatherArray.push(weatherObject);
        });
				resultObject.hiTemp = average(weatherArray.map(element => {
    			return element.hiTemp
    		}));
    		resultObject.loTemp = average(weatherArray.map(element => {
    			return element.loTemp
    		}));
    		resultObject.precip = average(weatherArray.map(element => {
    			return element.precip
    		}));
    		resultObject.maxWind = average(weatherArray.map(element => {
    			return element.maxWind
    		}));
    		resultObject.humidity = average(weatherArray.map(element => {
    			return element.humidity
    		}));
    		resultObject.cloudCover = average(weatherArray.map(element => {
    			return element.cloudCover
    		}));
    		console.log(resultObject);

        });

    		
    next();
};
//call profile data from database & filter weatherArray
climate.filterWeatherData = (req, res, next) => {
	const id = numericParam(req.params, "profileId");
	db.one(
        'SELECT * FROM profiles WHERE id=$1', [id]
    ).then(profile => {
    	console.log(profile);
    	next();
    }).catch(err => {
        console.error(`error in the climate.filterWeatherData: ${err}`);
    });
};












module.exports = climate;