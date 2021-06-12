'use strict'

// CustomClass
const moment = require('moment')
const { performance } = require('perf_hooks')
const _ = require('underscore')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const MasShift = use("App/Models/MasShift")
const Equipment = use("App/Models/MasEquipment")
const Pit = use("App/Models/MasPit")
const Fleet = use("App/Models/MasFleet")
const Activity = use("App/Models/MasActivity")
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
        const dateReq = new Date(req.datetime != undefined ? req.datetime : moment().format('YYYY-MM-DD HH:mm'))
        let durasi

        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
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

        
        let equipment_id = []
        try {    
            const dailyFleet = 
            (
                await DailyFleet.query()
                .with('details')
                .where('date', filterDate)
                .andWhere('shift_id', ShiftFilter.id)
                .orderBy('id', 'desc')
                .first()
            ).toJSON()
    
            
            for (const item of dailyFleet.details) {
                equipment_id.push(item.equip_id)
            }

            if(equipment_id){
                durasi = await diagnoticTime.durasi(t0)
                response.status(404).json({
                    diagnostic: {
                        times: durasi, 
                        error: true,
                        equipment: equipment_id,
                        message: 'List Equipment not available...'
                    },
                    req: moment(dateReq).format('YYYY-MM-DD HH:mm:ss'),
                    data: []
                })
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

            durasi = await diagnoticTime.durasi(t0)
            response.status(200).json({
                diagnostic: {
                    times: durasi,
                    exsistingEquipment: equipment_id,
                    error: false
                },
                data: data
            })
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            response.status(404).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    equipment: equipment_id,
                    message: error
                },
                req: moment(dateReq).format('YYYY-MM-DD HH:mm:ss'),
                data: []
            })
        }
    }

    async equipment_onFleet ({ auth, params, request, response }) {
        var t0 = performance.now()
        const { idfleet } = params
        const req = request.only(['datetime'])
        const dateReq = new Date(req.datetime != undefined ? req.datetime : moment().format('YYYY-MM-DD HH:mm'))
        let durasi

        try {
            await auth.authenticator('jwt').getUser()
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: []
            })
        }

        await GET_DATA_EQUIPMENT_ONFLEET()

        async function GET_DATA_EQUIPMENT_ONFLEET(){
            let data = []
            try {
                const dailyFleet = (
                    await DailyFleet
                    .query()
                    .with('details')
                    .where('id', idfleet)
                    .first()
                ).toJSON()
                for (const item of dailyFleet.details) {
                    const unit = (await Equipment.findOrFail(item.equip_id)).toJSON()
                    const pit = (await Pit.findOrFail(dailyFleet.pit_id)).toJSON()
                    const fleet = (await Fleet.findOrFail(dailyFleet.fleet_id)).toJSON()
                    const activity = (await Activity.findOrFail(dailyFleet.activity_id)).toJSON()
                    let image_uri
                    switch (unit.tipe) {
                        case "bulldozer":
                            image_uri = 'http://offices.mitraabadimahakam.id/equipment/bulldozer.jpg'
                            break;
                        case "excavator":
                            image_uri = 'http://offices.mitraabadimahakam.id/equipment/excavator.jpg'
                            break;
                        case "dump truck":
                            image_uri = 'http://offices.mitraabadimahakam.id/equipment/oht1.jpg'
                            break;
                        case "articulated":
                            image_uri = 'http://offices.mitraabadimahakam.id/equipment/adt.jpg'
                            break;
                    
                        default:
                            image_uri = 'http://offices.mitraabadimahakam.id/equipment/unnamed.png'
                            break;
                    }
                    data.push({
                        ...item,
                        image: image_uri,
                        equipment_detail: unit,
                        pit_id: dailyFleet.pit_id,
                        pit_detail: pit,
                        fleet_detail: fleet,
                        activity_detail: activity
                    })
                }
                durasi = await diagnoticTime.durasi(t0)
                response.status(200).json({
                    diagnostic: {
                        times: durasi,
                        req: dateReq,
                        error: false
                    },
                    data: data
                })
            } catch (error) {
                console.log(error)
                durasi = await diagnoticTime.durasi(t0)
                response.status(404).json({
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
}

module.exports = EquipmentApiController
