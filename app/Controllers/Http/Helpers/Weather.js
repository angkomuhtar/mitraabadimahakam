'use strict'

const MamWeather = use("App/Models/MamWeather")


class Weather {
    async LAST (req) {
        console.log('====================================');
        console.log(req);
        console.log('====================================');
        let mamWeather = await MamWeather.query().where({kota: req.city}).orderBy('created_at', 'desc').first()
        
        return mamWeather
    }
}

module.exports = new Weather()