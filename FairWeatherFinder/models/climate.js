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
const coordinatesArray = [];

//weather arrray and results object to compare to profile

const metaWeatherArray = [];
const resultObjectArray = [];
// const weatherArray2 = [];
// const resultObject2 = {};
// const weatherArray3 = [];
// const resultObject3 = {};
// const weatherArray4 = [];
// const resultObject4 = {};

//daysCounter will get us a sum of days that meet conditions
let daysCounter = 0;

// //server-side address storage
let sessionAddress = '';
let sessionAddress2 = '';
let sessionAddress3 = '';
let sessionAddress4 = '';

//generic average function
average = (array) => {
    let arrSum = array.reduce((sum, value) => {
        return sum + value;
    }, 0);
    return arrSum / array.length;
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
        cloudCover = req.body.cloudCover,
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
climate.convertAddresses = (req, res, next) => {
    console.log('firing inside climate.convertAddress');
    const addressArray = req.body.addresses;
    sessionAddress = req.body.addresses[0];
    if(addressArray.length > 1){ sessionAddress2 = req.body.addresses[1]; };
    if(addressArray.length > 2){ sessionAddress3 = req.body.addresses[2]; };
    if(addressArray.length > 3){ sessionAddress4 = req.body.addresses[3]; };
    console.log("inside convertAddresses", addressArray);
    const addressPromises = [];
  
    // for (let i = 0; i < addressArray.length; i++) {

        addressArray.forEach(element => {
        let address = element.replace(/ /g, '+');
        console.log(address);
        addressPromises.push(
            axios({
                url: `${googleApiUrl}?address=${address}&key=${googleApiKey}`,
                method: 'GET'
            }));
    });

    axios.all(addressPromises).then(results => {
        results.forEach(response => {
            const locationData = response.data.results[0].geometry.location;
            const coordinates = {};
            coordinates.lat = locationData.lat;
            coordinates.long = locationData.lng;
            console.log('coordinates in loop', coordinates);
            coordinatesArray.push(coordinates);
            console.log("coordinates array:", coordinatesArray);
        });
    })

    next();

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
    

    coordinatesArray.forEach(element => {
        const lat = element.lat;
        const long = element.long;
        console.log("lat:", lat);
        console.log("long: ", long);
        const weatherArray = [];
        const resultObject = {};

        // console.log(`${darkSkiesUrl}${darkSkiesApiKey}/${lat},${long},${unixStartDate}`);
    

    let weatherPromises = [];
   
    // for (let i = 0; i < callLength; i++) {
    //     let unixDate = unixStartDate + i * 84600;
    //     weatherPromises.push(
    //         axios({
    //             url: `${darkSkiesUrl}${darkSkiesApiKey}/${lat},${long},${unixDate}`,
    //             method: 'GET'
    //         })
    //     );
    // };

    // axios.all(weatherPromises).then(results => {
    //     results.forEach(response => {
    //         const weatherObject = {};
    //         const dailyData = response.data.daily.data[0];
    //         weatherObject.hiTemp = dailyData.temperatureMax;
    //         weatherObject.loTemp = dailyData.temperatureMin;
    //         weatherObject.precip = dailyData.precipIntensityMax;
    //         weatherObject.maxWind = dailyData.windSpeed;
    //         weatherObject.humidity = dailyData.humidity;
    //         weatherObject.cloudCover = dailyData.cloudCover;
    //         weatherObject.icon = dailyData.icon;
    //         console.log(weatherObject);
    //         weatherArray1.push(weatherObject);
    //     })
    //     resultObject.hiTemp = average(weatherArray.map(element => {
    //         return element.hiTemp
    //     }));
    //     resultObject.loTemp = average(weatherArray.map(element => {
    //         return element.loTemp
    //     }));
    //     resultObject.precip = average(weatherArray.map(element => {
    //         return element.precip
    //     }));
    //     resultObject.maxWind = average(weatherArray.map(element => {
    //         return element.maxWind
    //     }));
    //     resultObject.humidity = average(weatherArray.map(element => {
    //         return element.humidity
    //     }));
    //     resultObject.cloudCover = average(weatherArray.map(element => {
    //         return element.cloudCover
    //     }));
    //     console.log(resultObject);
            // metaWeatherArray.push(weatherArray);
// });

});



    // res.locals.resultObject = resultObject1;
    // for (let i = 0; i < callLength; i++) {
    //     let unixDate = unixStartDate + i * 84600;
    //     weatherPromises2.push(
    //         axios({
    //             url: `${darkSkiesUrl}${darkSkiesApiKey}/${lat2},${long2},${unixDate}`,
    //             method: 'GET'
    //         })
    //     );
    // };

    // axios.all(weatherPromises2).then(results => {
    //     results.forEach(response => {
    //         weatherObject2 = {};
    //         const dailyData = response.data.daily.data[0];
    //         weatherObject2.hiTemp = dailyData.temperatureMax;
    //         weatherObject2.loTemp = dailyData.temperatureMin;
    //         weatherObject2.precip = dailyData.precipIntensityMax;
    //         weatherObject2.maxWind = dailyData.windSpeed;
    //         weatherObject2.humidity = dailyData.humidity;
    //         weatherObject2.cloudCover = dailyData.cloudCover;
    //         weatherObject2.icon = dailyData.icon;
    //         console.log(weatherObject2);
    //         weatherArray2.push(weatherObject2);
    //     });
    //     resultObject2.hiTemp = average(weatherArray2.map(element => {
    //         return element.hiTemp
    //     }));
    //     resultObject2.loTemp = average(weatherArray2.map(element => {
    //         return element.loTemp
    //     }));
    //     resultObject2.precip = average(weatherArray2.map(element => {
    //         return element.precip
    //     }));
    //     resultObject2.maxWind = average(weatherArray2.map(element => {
    //         return element.maxWind
    //     }));
    //     resultObject2.humidity = average(weatherArray2.map(element => {
    //         return element.humidity
    //     }));
    //     resultObject2.cloudCover = average(weatherArray2.map(element => {
    //         return element.cloudCover
    //     }));
    //     console.log(resultObject2);

    // });
    // res.locals.resultObject2 = resultObject2;
    // for (let i = 0; i < callLength; i++) {
    //     let unixDate = unixStartDate + i * 84600;
    //     weatherPromises3.push(
    //         axios({
    //             url: `${darkSkiesUrl}${darkSkiesApiKey}/${lat3},${long3},${unixDate}`,
    //             method: 'GET'
    //         })
    //     );
    // };

    // axios.all(weatherPromises3).then(results => {
    //     results.forEach(response => {
    //         weatherObject3 = {};
    //         const dailyData = response.data.daily.data[0];
    //         weatherObject3.hiTemp = dailyData.temperatureMax;
    //         weatherObject3.loTemp = dailyData.temperatureMin;
    //         weatherObject3.precip = dailyData.precipIntensityMax;
    //         weatherObject3.maxWind = dailyData.windSpeed;
    //         weatherObject3.humidity = dailyData.humidity;
    //         weatherObject3.cloudCover = dailyData.cloudCover;
    //         weatherObject3.icon = dailyData.icon;
    //         console.log(weatherObject3);
    //         weatherArray3.push(weatherObject3);
    //     });
    //     resultObject3.hiTemp = average(weatherArray3.map(element => {
    //         return element.hiTemp
    //     }));
    //     resultObject3.loTemp = average(weatherArray3.map(element => {
    //         return element.loTemp
    //     }));
    //     resultObject3.precip = average(weatherArray3.map(element => {
    //         return element.precip
    //     }));
    //     resultObject3.maxWind = average(weatherArray3.map(element => {
    //         return element.maxWind
    //     }));
    //     resultObject3.humidity = average(weatherArray3.map(element => {
    //         return element.humidity
    //     }));
    //     resultObject3.cloudCover = average(weatherArray3.map(element => {
    //         return element.cloudCover
    //     }));
    //     console.log(resultObject3);

    // });
    // res.locals.resultObject3 = resultObject3;
    // for (let i = 0; i < callLength; i++) {
    //     let unixDate = unixStartDate + i * 84600;
    //     weatherPromises4.push(
    //         axios({
    //             url: `${darkSkiesUrl}${darkSkiesApiKey}/${lat4},${long4},${unixDate}`,
    //             method: 'GET'
    //         })
    //     );
    // };

    // axios.all(weatherPromises4).then(results => {
    //     results.forEach(response => {
    //         weatherObject4 = {};
    //         const dailyData = response.data.daily.data[0];
    //         weatherObject4.hiTemp = dailyData.temperatureMax;
    //         weatherObject4.loTemp = dailyData.temperatureMin;
    //         weatherObject4.precip = dailyData.precipIntensityMax;
    //         weatherObject4.maxWind = dailyData.windSpeed;
    //         weatherObject4.humidity = dailyData.humidity;
    //         weatherObject4.cloudCover = dailyData.cloudCover;
    //         weatherObject4.icon = dailyData.icon;
    //         console.log(weatherObject4);
    //         weatherArray4.push(weatherObject4);
    //     });
    //     resultObject4.hiTemp = average(weatherArray4.map(element => {
    //         return element.hiTemp
    //     }));
    //     resultObject4.loTemp = average(weatherArray4.map(element => {
    //         return element.loTemp
    //     }));
    //     resultObject4.precip = average(weatherArray4.map(element => {
    //         return element.precip
    //     }));
    //     resultObject4.maxWind = average(weatherArray4.map(element => {
    //         return element.maxWind
    //     }));
    //     resultObject4.humidity = average(weatherArray4.map(element => {
    //         return element.humidity
    //     }));
    //     resultObject4.cloudCover = average(weatherArray4.map(element => {
    //         return element.cloudCover
    //     }));
    //     console.log(resultObject4);

    // });
    // res.locals.resultObject4 = resultObject4;
    // next();
};
//call profile data from database & filter weatherArray
climate.filterWeatherData = (req, res, next) => {
    const id = numericParam(req.params, "profileId");
    db.one(
        'SELECT * FROM profiles WHERE id=$1', [id]
    ).then(profile => {
        daysCounter = 0;
        console.log(profile);
        console.log('in filterWeatherData model');
        console.log(weatherArray);

        weatherArray.forEach(element => {
            if (element.hiTemp < profile.hitemp &&
                element.loTemp > profile.lotemp &&
                element.precip < profile.precip &&
                element.maxWind < profile.maxwind &&
                element.humidity < profile.humidity &&
                element.cloudCover < profile.cloudcover) {
                daysCounter = daysCounter + 1;
            };
        });
        res.locals.counter = daysCounter;
        res.locals.length = weatherArray.length;
        res.locals.address = sessionAddress;
        console.log(sessionAddress);
        console.log('counter', daysCounter);
        console.log('days Checked ', weatherArray.length);
        next();
    }).catch(err => {
        console.error(`error in the climate.filterWeatherData: ${err}`);
    });
};












module.exports = climate;