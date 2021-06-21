'use strict'

const TimeSheet = use("App/Controllers/Http/Helpers/TimeSheet")
const P2Hhelpers = use("App/Controllers/Http/Helpers/P2H")

class DailyTimesheetController {
    async index ({ view }) {
        return view.render('operation.daily-timesheet.index')
    }

    async list ({ view, request, response, auth }) {
        const req = request.all()
        const data = (await TimeSheet.ALL(req)).toJSON()
        return view.render('operation.daily-timesheet.list', {list: data, keyword: req.keyword})
    }

    async listP2H ({ view, request }){
        const req = request.only(['keyword', 'page'])
        const p2hItems = (await P2Hhelpers.ALL(req)).toJSON()
        return view.render('_component.list-p2h', {list: p2hItems})
    }

    async show ({ view, request, params, auth }) {
        const data = (await TimeSheet.GET_ID(params)).toJSON()
        return view.render('operation.daily-timesheet.show', {data: data})
    }
    
}

module.exports = DailyTimesheetController
