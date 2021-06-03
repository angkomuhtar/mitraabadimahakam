'use strict'

// CustomClass
const moment = require('moment')
const { performance } = require('perf_hooks')
const { now } = require('underscore')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const MasShift = use("App/Models/MasShift")
const Equipment = use("App/Models/MasEquipment")
const DailyFleet = use("App/Models/DailyFleet")
const DailyFleetEquip = use("App/Models/DailyFleetEquip")

class EquipmentApiController {
    async index ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['keyword'])
        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }

        let equipment
        if(req.keyword){
            equipment = 
                await Equipment
                    .query()
                    .where(word => {
                        word.where('kode', 'like', `%${req.keyword}%`)
                        word.orWhere('brand', 'like', `%${req.keyword}%`)
                        word.orWhere('tipe', 'like', `%${req.keyword}%`)
                        word.orWhere('unit_model', 'like', `%${req.keyword}%`)
                    })
                    .andWhere({aktif: 'Y'})
                    .fetch()
        }else{
            equipment = 
                await Equipment.query().where({aktif: 'Y'}).fetch()
        }

        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: equipment
        })
    }

    async availableForFleet ({auth, request, response}) {
        var t0 = performance.now()
        const req = request.only(['datetime'])
        const dateReq = new Date(req.datetime)

        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: []
            })
        }
        
        const filterDate = moment(dateReq).format('YYYY-MM-DD')
        // const filterTime = moment(dateReq).format('HH:mm')
        const listShift = (await MasShift.query().select('id', 'name', 'kode', 'start_shift', 'end_shift').fetch()).toJSON()
        const shiftData = listShift.map(item => {
            var start = `${ filterDate } ${ item.start_shift }`
            var end = `${moment(`${filterDate} ${item.start_shift}`).add(12, 'h')}`
            if(new Date(start) < new Date(dateReq) && new Date(end) > new Date(dateReq)){
                return {
                    ...item,
                    status: true,
                    start_shift: start,
                    end_shift: end
                }
            }else{
                return {
                    ...item,
                    status: false,
                    start_shift: start,
                    end_shift: end
                }
            }
        })

        const [ShiftFilter] = shiftData.filter(item => item.status)
        try {

            const dailyFleet = (
                await DailyFleet.query()
                .with('details')
                .where('shift_id', ShiftFilter.id)
                .fetch()
            ).toJSON()
                
            let equipment_id = []
            for (const item of dailyFleet) {
                for (const list of item.details) {
                    equipment_id.push(list.equip_id)
                }
            }
                        
                        
            let data = []
            let equipment = (await Equipment.query().where({aktif: 'Y'}).fetch()).toJSON()
            for (const item of equipment) {
                if(equipment_id.includes(item.id)){
                    data.push({...item, on_fleet: true})
                }else{
                    data.push({...item, on_fleet: false})
                }
            }

            let durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi,
                    req: dateReq,
                    error: false
                },
                data: data
            })
        } catch (error) {
            console.log(error)
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(404).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error
                },
                req: moment(dateReq).format('YYYY-MM-DD HH:mm:ss'),
                data: []
            })
        }
    }
}

module.exports = EquipmentApiController
