'use strict'

const TimeSheet = use("App/Controllers/Http/Helpers/TimeSheet")
const P2Hhelpers = use("App/Controllers/Http/Helpers/P2H")
const moment = require('moment')

class DailyTimesheetController {
    async index ({ view }) {
        return view.render('operation.daily-timesheet.index')
    }

    async list ({ view, request, response, auth }) {
        const req = request.all()
        const data = (await TimeSheet.ALL(req)).toJSON()
        return view.render('operation.daily-timesheet.list', {list: data, keyword: req.keyword})
    }

    async create ( { auth, view } ) {
        console.log('....');
        return view.render('operation.daily-timesheet.create')
    }

    async store ( { auth, request } ) {
        let usr
        try {
            usr = await auth.getUser()
        } catch (error) {
            return {
                success: false,
                message: 'You not authorized...'
            }
        }
        const req = request.raw()
        const reqJson = JSON.parse(req)

        const data = await TimeSheet.POST(reqJson, usr)
        return data
    }

    async listP2H ({ view, request }){
        const req = request.only(['id', 'keyword', 'page'])
        try {
            const p2hItems = await P2Hhelpers.WITH_TIMESHEET_ID(req)
            return view.render('_component.list-p2h', {list: p2hItems})
        } catch (error) {
            throw new Error('Tidak dapat load data...')
        }
    }

    async addEvent ({ view }){
        return view.render('_component.list-event-timesheet')
    }

    async show ({ view, params, auth }) {
        const data = (await TimeSheet.GET_ID(params)).toJSON()
        console.log(data);
        return view.render('operation.daily-timesheet.show', {data: data})
    }

    async update ({ auth, params, request }) {
        const usr = await auth.getUser()
        const req = JSON.parse(request.raw())
        req.end_smu = req.end_smu === '-' ? null : req.end_smu
        req.event = req.event.filter(item => item.event_id != null)
        req.event = req.event.map(item => {
            delete item['smu_event']
            return {
                ... item,
                user_id: usr.id,
                timesheet_id: params.id,
                equip_id: req.unit_id
            }
        })
        
        try {
            const data = await TimeSheet.UPDATE(params, req)
            console.log(data);
            return {
                success: true,
                message: 'TIME SHEET update success...'
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: 'TIME SHEET update failed...'
            }
        }
    }
    
}

module.exports = DailyTimesheetController
