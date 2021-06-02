'use strict'
const { performance } = require('perf_hooks')
const moment = require('moment')
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
        const dateReq = new Date()
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
        
        const filterTime = moment(dateReq).format('HH:mm:ss')
        try {
            const shiftClock = 
                await MasShift.query()
                .where(
                    builder => 
                    builder.where('start_shift', '<=', filterTime)
                    .where('end_shift', '>', filterTime)
                    .where({status: 'Y'}))
                    .first()

            const dailyFleet = (
                await DailyFleet.query()
                    .with('details')
                    .where('shift_id', shiftClock.id)
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
                data: data
            })
        }
    }
}

module.exports = EquipmentApiController
