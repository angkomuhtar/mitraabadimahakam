'use strict'

const SummaryOB = use("App/Models/VTimeSheet")
const MasEvent = use("App/Models/MasEvent")
const _ = require("underscore")

class DailyActivityController {
    async index ({auth, view, request}) {
        const usr = await auth.getUser()
        return view.render('operation.summary-ob.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let list = (await SummaryOB
            .query()
            .with('dailyevent')
            .distinct(
                'no_timesheet', 
                'dailyfleet_id', 
                'shift', 
                'date',
                'begin_smu',
                'end_smu',
                'used_smu',
                'kd_unit',
                'tipe_unit',
                'unit_model',
            )
            .orderBy('date', 'desc')
            .paginate(halaman, limit)).toJSON()
        

        const mas_event = (await MasEvent.query().where('aktif', 'Y').select('id', 'kode', 'narasi', 'satuan', 'engine').fetch()).toJSON()
        
        list.data = list.data.map(item => {
            return {
                ...item,
                record_event: mas_event.map(obj => {
                    var time_duration = _.find(item.dailyevent, val => val.event_id === obj.id) 
                    return {
                        ...obj,
                        time_duration: time_duration ? time_duration.time_duration : 0
                    }
                })
            }
        })

        console.log(JSON.stringify(list, null, 3));
        return view.render('operation.summary-ob.list', {list: list})
    }
}

module.exports = DailyActivityController
