'use strict'

const moment = require("moment")
const DailyRitaseCoalHelpers = use("App/Controllers/Http/Helpers/DailyRitaseCoal")
const DailyRitaseCoalDeatilHelpers = use("App/Controllers/Http/Helpers/DailyRitaseCoalDetail")

class DailyRitaseCoalController {
    async index ({ view }) {
        return view.render('operation.daily-ritase-coal.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        let data = []
        try {
            data = await DailyRitaseCoalDeatilHelpers.ALL(req)
            console.log('====================================');
            console.log(data.toJSON());
            console.log('====================================');
        } catch (error) {
            
        }
        return view.render('operation.daily-ritase-coal.list', {list: data.toJSON()})
    }
}

module.exports = DailyRitaseCoalController
