'use strict'

const TimeSheet = use("App/Controllers/Http/Helpers/TimeSheet")

class DailyTimesheetController {
    async index ({ view }) {
        return view.render('operation.daily-timesheet.index')
    }

    async list ({ view, request, response, auth }) {
        const req = request.all()
        const data = (await TimeSheet.ALL(req)).toJSON()
        return view.render('operation.daily-timesheet.list', {list: data, keyword: req.keyword})
    }

    async show ({ view, request, params, auth }) {
        const data = (await TimeSheet.GET_ID(params)).toJSON()
        return view.render('operation.daily-timesheet.show', {data: data})
    }
    
}

module.exports = DailyTimesheetController
