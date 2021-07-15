'use strict'

const SummaryOB = use("App/Models/VTimeSheet")
const MasEvent = use("App/Models/MasEvent")
const MasActivity = use("App/Models/MasActivity")
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
            // .where('material', '!=', 'COAL')
            .distinct(
                'no_timesheet', 
                'dailyfleet_id', 
                'shift', 
                'date',
                'begin_smu',
                'end_smu',
                'used_smu',
                'unit_id',
                'kd_unit',
                'tipe_unit',
                'unit_model',
                'activity',
                'ritase_ob',
                'material'
            )
            .orderBy('date', 'desc')
            .paginate(halaman, limit)).toJSON()
        

        const mas_event = (await MasEvent.query().where('aktif', 'Y').select('id', 'kode', 'narasi', 'satuan', 'engine', 'status').orderBy('status').fetch()).toJSON()
        const masActivity = (await MasActivity.query().where('sts', 'Y').fetch()).toJSON()
        list.data = list.data.map(item => {
            return {
                ...item,
                record_event: mas_event.map(obj => {
                    var time_duration = _.find(item.dailyevent, val => val.event_id === obj.id) 
                    return {
                        ...obj,
                        time_duration: time_duration ? (parseFloat(time_duration.time_duration)/60).toFixed(2) : 0
                    }
                })
            }
        })

        // console.log(JSON.stringify(list, null, 3));
        console.log(list.data);
        return view.render('operation.summary-ob.list', {
            list: list, 
            event: mas_event, 
            activity: masActivity
        })
    }
}

module.exports = DailyActivityController
