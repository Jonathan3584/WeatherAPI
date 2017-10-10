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
    });
    );
}

axios.all(weatherPromises)
.then(weatherData => {
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
    weatherArray.push(weatherObject);
};