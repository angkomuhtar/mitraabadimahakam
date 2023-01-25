'use strict'

const { performance } = require('perf_hooks')
const MamWeather = use("App/Models/MamWeather")
const WeatherHelpers = use("App/Controllers/Http/Helpers/Weather")
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const axios = require('axios').default;

class ApiWeatherController {
    async getWeather () {
        const uri = 'https://api.openweathermap.org/data/2.5/weather?q=samarinda&appid=c47c30511efe1a9cd1131af21d913aea'
        async function formatIcon(ico){
            let icons
            switch (ico) {
                case '01d':
                    icons = 'sunny-outline'
                    break;
                case '02d':
                    icons = 'ios-partly-sunny-outline'
                    break;
                case '03d':
                    icons = 'cloudy-outline'
                    break;
                case '04d':
                    icons = 'cloudy-outline'
                    break;
                case '09d':
                    icons = 'ios-rainy-outline'
                    break;
                case '10d':
                    icons = 'ios-rainy-outline'
                    break;
                case '11d':
                    icons = 'ios-thunderstorm-outline'
                    break;
                case '01n':
                    icons = 'ios-moon-outline'
                    break;
                case '02n':
                    icons = 'ios-cloudy-night-outline'
                    break;
                case '03n':
                    icons = 'ios-cloudy-night-outline'
                    break;
                case '04n':
                    icons = 'cloudy-outline'
                    break;
                case '09n':
                    icons = 'ios-rainy-outline'
                    break;
                case '10n':
                    icons = 'ios-rainy-outline'
                    break;
                case '11n':
                    icons = 'ios-thunderstorm-outline'
                    break;
                default:
                    icons = 'ios-partly-sunny-outline'
                    break;
            }
            return icons
        }

        axios.get(uri)
        .then(async function (response) {
            const {data} = response;
            console.log(response.data);
            try {
                const mamWeather = new MamWeather()
                mamWeather.fill({
                    kota: (data.name).toLowerCase(),
                    weather: data.weather[0].main,
                    description: data.weather[0].description,
                    icon: await formatIcon(data.weather[0].icon),
                    temp: (parseFloat(data.main.temp) - parseFloat('273.15')).toFixed(0),
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

    async getWeatherCity ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['city'])
        let durasi;
        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        };

        try {
            const data = await WeatherHelpers.LAST(req)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: data
            })
        } catch (error) {
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }
    }
}

module.exports = ApiWeatherController
