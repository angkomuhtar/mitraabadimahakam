'use strict'

const SummaryOB = use("App/Models/VTimeSheet")
const MasEvent = use("App/Models/MasEvent")
const MasActivity = use("App/Models/MasActivity")
const { map } = require("underscore")
const _ = require("underscore")

class DailyActivityController {
    async index ({auth, view, request}) {
        const usr = await auth.getUser()
        return view.render('operation.summary-ob.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        const limit = 15
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const arrTimeSheet = (await SummaryOB.query().distinct('no_timesheet').select('no_timesheet').fetch()).toJSON()


        // list.data = [...list.data.reduce((a,c)=>{
        //     a.set(c.no_timesheet, c)
        //     return a;
        //   }, new Map()).values()]
        

        const mas_event = (await MasEvent.query().where('aktif', 'Y').select('id', 'kode', 'narasi', 'satuan', 'engine', 'status').orderBy('status').fetch()).toJSON()
        const masActivity = (await MasActivity.query().where('sts', 'Y').fetch()).toJSON()
        let list = (await SummaryOB
            .query()
            .with('dailyevent')
            .whereIn('no_timesheet', arrTimeSheet.map(a => a.no_timesheet))
            .orderBy('date', 'desc')
            .paginate(halaman, limit)
            ).toJSON()
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
        // console.log(list);
        return view.render('operation.summary-ob.list', {
            list: list, 
            event: mas_event, 
            activity: masActivity
        })
    }
}

module.exports = DailyActivityController
