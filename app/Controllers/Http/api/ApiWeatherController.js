'use strict'

const MamWeather = use("App/Models/MamWeather")

const axios = require('axios').default;

class ApiWeatherController {
    async getWeather () {
        const uri = 'https://api.openweathermap.org/data/2.5/weather?q=samarinda&appid=c47c30511efe1a9cd1131af21d913aea'
        
        axios.get(uri)
        .then(async function (response) {
            const {data} = response
            console.log(response.data);
            try {
                const mamWeather = new MamWeather()
                mamWeather.fill({
                    kota: (data.name).toLowerCase(),
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                    temp: data.main.temp,
                    long: data.coord.lon,
                    lat: data.coord.lat
                })
                await mamWeather.save()
            } catch (error) {
                console.log(error);
            }
            
        })
        .catch(function (error) {
          console.log(error);
        })
    }
}

module.exports = ApiWeatherController
