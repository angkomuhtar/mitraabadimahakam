'use strict'

// const axios = require('axios');
// const Env = use('Env')
// const host = Env.get('HOST')
// const port = Env.get('PORT')
const TimeSheet = use("App/Controllers/Http/Helpers/TimeSheet")

class DailyTimesheetController {
    async index ({ view }) {
        return view.render('operation.daily-timesheet.index')
    }

    async list ({ view, request, response, auth }) {
        const req = request.all()
        const data = (await TimeSheet.ALL(req)).toJSON()
        return view.render('operation.daily-timesheet.list', {list: data})
    }
    
}

module.exports = DailyTimesheetController
