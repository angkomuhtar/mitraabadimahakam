'use strict'

const { performance } = require('perf_hooks')
const MamWeather = use("App/Models/MamWeather")
const WeatherHelpers = use("App/Controllers/Http/Helpers/Weather")
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

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
                    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                    temp: (parseFloat(data.main.temp) - parseFloat('273.15')).toFixed(1),
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
        let durasi
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
        }

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
