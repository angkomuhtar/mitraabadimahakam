'use strict'

// const DailyFleet = use("App/models/DailyFleet")

const DailyFleetHelper = use("App/Controllers/Http/Helpers/DailyFleet")

class AjaxDailyFleetController {
    async getDailyfleet ({params, view}) {
        const data = (await DailyFleetHelper.GET_ID(params)).toJSON()
        return view.render('_component.list-dailyfleet', {data: data})
    }
}

module.exports = AjaxDailyFleetController
