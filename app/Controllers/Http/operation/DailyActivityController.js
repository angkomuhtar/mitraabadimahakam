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
const MasMaterial = use("App/Models/MasMaterial")
const DailyEvent = use("App/Models/DailyEvent")
const DailyRitase = use("App/Models/DailyRitase")
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")
const _ = require("underscore")
const moment = require('moment')
moment.locale("id")

class DailyActivityController {
    async index ({auth, view, request}) {
        const usr = await auth.getUser()
        return view.render('operation.summary-ob.index')
    }

    async list ({ request, view }) {
        const req = request.all()
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)

        let timeSheet = []

        const reqUnit = request.only(['unit'])
        const arrayUnit = reqUnit.unit && reqUnit.unit.split(',')
        
        const fleetOB = (await DailyRitase.query().where('status', 'Y').fetch()).toJSON()
        const arrFleetOB = fleetOB.map(item => item.dailyfleet_id)
        

        if(req.filter === 'date'){
            timeSheet = (
                await TimeSheet
                    .query()
                    .whereIn('dailyfleet_id', arrFleetOB)
                    .andWhere(w => {
                        w.where('tgl', '>=', req.range_begin)
                        .andWhere('tgl', '<=', req.range_end)
                    })
                    .orderBy('id', 'desc')
                    .paginate(halaman, limit)
            ).toJSON()
        }else if(req.filter === 'shift'){
            const dailyFleet = (await DailyFleet.query().whereIn('id', arrFleetOB).andWhere('shift_id', req.shift).fetch()).toJSON()
            timeSheet = (
                await TimeSheet
                    .query()
                    .whereIn('dailyfleet_id', dailyFleet.map(i => i.id))
                    .andWhere(w => {
                        w.where('tgl', '>=', req.range_begin)
                        .andWhere('tgl', '<=', req.range_end)
                    })
                    .orderBy('id', 'desc')
                    .paginate(halaman, limit)
            ).toJSON()
        }else if(req.filter === 'unit'){
            timeSheet = (
                await TimeSheet
                    .query()
                    .whereIn('dailyfleet_id', arrFleetOB)
                    .andWhere(w => {
                        w.whereIn('unit_id', arrayUnit)
                        .andWhere('tgl', '>=', req.range_begin)
                        .andWhere('tgl', '<=', req.range_end)
                    })
                    .orderBy('id', 'desc')
                    .paginate(halaman, limit)
            ).toJSON()
        }else{
            timeSheet = (
                    await TimeSheet
                        .query()
                        .whereIn('dailyfleet_id', arrFleetOB)
                        .orderBy('id', 'desc')
                        .paginate(halaman, limit)
                ).toJSON()
        }


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

            /* Find Daily Ritase OB */
            item.is_exca = unit.tipe === 'excavator'
            item.ritase_ob = 0
            item.volume_ob = 0
            item.pdtvy = null
            item.material = null
            item.material_nm = '-'

            

            var waktuMulai = new Date(moment(item.tgl).format('YYYY-MM-DD')+' '+shift.start_shift)
            var waktuBerakhir = moment(waktuMulai).add(shift.duration, 'hours').format('YYYY-MM-DD HH:mm:ss')
            

            let dailyRitase = await DailyRitase.findBy('dailyfleet_id', item.dailyfleet_id)
            if(dailyRitase){
                let v_material = await MasMaterial.find(dailyRitase.material)
                item.ritase_ob = await DailyRitaseDetail.query()
                    .where(w => {
                        w.where('check_in', '>=', waktuMulai)
                        .andWhere('check_in', '<=', waktuBerakhir)
                    })
                    .andWhere('dailyritase_id', dailyRitase.id)
                    .andWhere('hauler_id', item.unit_id)
                    .getCount()
                item.ritase_ob = unit.tipe === 'excavator' ? '-' : item.ritase_ob
                /* Jika unit excavator maka volume_ob = total ritase semua hauler x volume OB */
                var volumUnit = item.is_exca ? (parseFloat(v_material.vol) * parseFloat(dailyRitase.tot_ritase)) : (parseFloat(v_material.vol) * parseFloat(item.ritase_ob))
                item.volume_ob = volumUnit

                var productivityUnit = item.is_exca ? (parseFloat(item.volume_ob) / parseFloat(item.used_smu)).toFixed(2) : (parseFloat(item.volume_ob) / parseFloat(item.used_smu)).toFixed(2)
                item.pdtvy = productivityUnit
                item.material = v_material.tipe
                item.material_nm = v_material.name
            }

            result.push({
                ...item, 
                tgl: moment(item.tgl).format('dddd, Do MMMM YYYY'),
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
        

        const mas_event = (await MasEvent.query().where('aktif', 'Y').select('id', 'kode', 'narasi', 'satuan', 'engine', 'status').orderBy('status').fetch()).toJSON()
        const masActivity = (await MasActivity.query().where('sts', 'Y').fetch()).toJSON()
        

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
        // console.log(timeSheet.data[0].record_event);
        return view.render('operation.summary-ob.list', {
            list: timeSheet, 
            event: mas_event, 
            activity: masActivity
        })
    }
}

module.exports = DailyActivityController
