//require connection to database
const db = require('../db/setup');

const climate = {};

climate.createNewProfile = (req, res, next) => {

	//PUT THE PROFILE FORM INTO THE PROFILE DATABASE
	//RETURN climate ID
};
climate.convertZipCode = (req, res, next) => {
//axios call to ______ to convert a zipcode into a lat/long set
};
climate.getWeatherData = (req, res, next) => {
//axios call to DARK SKY API to retrieve a block of data
};
climate.retrieveProfile = (req, res, next) => {
//db call to get profile by name
};














module.exports = climate;