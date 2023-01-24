'use strict'

const DailyFleet = use("App/Models/DailyFleet")

class TimeSheet {
    async GET_ID (params) { 
        const dailyFleet = await DailyFleet
            .query()
            .with('pit', site => site.with('site'))
            .with('fleet')
            .with('activities')
            .with('shift')
            .with('user')
            .with('details', eq => eq.with('equipment'))
            .where('id', params.id)
            .first()
        return dailyFleet
    }
}

module.exports = new TimeSheet()