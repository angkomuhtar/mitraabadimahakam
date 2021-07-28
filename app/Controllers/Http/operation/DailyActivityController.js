'use strict'

const SummaryOB = use("App/Models/VTimeSheet")
const TimeSheet = use("App/Models/DailyChecklist")
const Profile = use("App/Models/Profile")
const MasEmployee = use("App/Models/MasEmployee")
const MasEquipment = use("App/Models/MasEquipment")
const DailyFleet = use("App/Models/DailyFleet")
const MasShift = use("App/Models/MasShift")
const MasEvent = use("App/Models/MasEvent")
const MasFleet = use("App/Models/MasFleet")
const MasPit = use("App/Models/MasPit")
const MasSite = use("App/Models/MasSite")
const MasActivity = use("App/Models/MasActivity")
const DailyEvent = use("App/Models/DailyEvent")
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
        // const arrTimeSheet = (await SummaryOB.query().distinct('no_timesheet').select('no_timesheet').fetch()).toJSON()


        let timeSheet = (
                await TimeSheet
                    .query()
                    .orderBy('id', 'desc')
                    .paginate(halaman, limit)
            ).toJSON()

        let result = []

        for (const item of timeSheet.data) {
            let checker = (await Profile.findBy('user_id', item.user_chk)).toJSON()
            let pengawas = (await Profile.findBy('user_id', item.user_spv)).toJSON()
            let operator = (await MasEmployee.findBy('id', item.operator)).toJSON()
            let unit = (await MasEquipment.findBy('id', item.unit_id)).toJSON()
            let dailyfleet = (await DailyFleet.findBy('id', item.dailyfleet_id)).toJSON()
            let activity = (await MasActivity.findBy('id', dailyfleet.activity_id)).toJSON()
            let fleet = (await MasFleet.findBy('id', dailyfleet.fleet_id)).toJSON()
            let shift = (await MasShift.findBy('id', dailyfleet.shift_id)).toJSON()
            let pit = (await MasPit.findBy('id', dailyfleet.pit_id)).toJSON()
            let site = (await MasSite.findBy('id', pit.site_id)).toJSON()
            let dailyevent = (await DailyEvent.query().where('timesheet_id', item.id).fetch()).toJSON() || []
            
            result.push({
                ...item, 
                checker,
                pengawas,
                operator,
                unit,
                dailyfleet,
                pit,
                site,
                shift,
                fleet,
                activity,
                dailyevent
            })
        }

        // timeSheet = timeSheet.map(async item => {
        //     let checker = await Profile.findBy('user_id', item.user_chk)
        //     return {
        //         ...item,
        //         user_chk: checker.toJSON()
        //     }
        // })
        

        // list.data = [...list.data.reduce((a,c)=>{
        //     a.set(c.no_timesheet, c)
        //     return a;
        //   }, new Map()).values()]
        

        const mas_event = (await MasEvent.query().where('aktif', 'Y').select('id', 'kode', 'narasi', 'satuan', 'engine', 'status').orderBy('status').fetch()).toJSON()
        const masActivity = (await MasActivity.query().where('sts', 'Y').fetch()).toJSON()
        // let list = (await SummaryOB
        //     .query()
        //     .with('dailyevent')
        //     .whereIn('no_timesheet', arrTimeSheet.map(a => a.no_timesheet))
        //     .orderBy('date', 'desc')
        //     .paginate(halaman, limit)
        //     ).toJSON()
        // list.data = list.data.map(item => {
        //     return {
        //         ...item,
        //         record_event: mas_event.map(obj => {
        //             var time_duration = _.find(item.dailyevent, val => val.event_id === obj.id) 
        //             return {
        //                 ...obj,
        //                 time_duration: time_duration ? (parseFloat(time_duration.time_duration)/60).toFixed(2) : 0
        //             }
        //         })
        //     }
        // })

        result = result.map(item => {
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

        timeSheet.data = result

        // console.log(JSON.stringify(list, null, 3));
        // console.log(list);
        return view.render('operation.summary-ob.list', {
            // dummy: JSON.stringify(result, null, 5),
            // list: list, 
            list: timeSheet, 
            event: mas_event, 
            activity: masActivity
        })
    }
}

module.exports = DailyActivityController
