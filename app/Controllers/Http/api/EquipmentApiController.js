'use strict'

// CustomClass
const moment = require('moment')
const { performance } = require('perf_hooks')
const _ = require('underscore')
const Db = use('Database')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const EquipmentHelpers = use("App/Controllers/Http/Helpers/Equipment")

const Pit = use("App/Models/MasPit")
const Fleet = use("App/Models/MasFleet")
const Event = use("App/Models/MasEvent")
const MasShift = use("App/Models/MasShift")
const Activity = use("App/Models/MasActivity")
const DailyEvent = use("App/Models/DailyEvent")
const DailyFleet = use("App/Models/DailyFleet")
const Equipment = use("App/Models/MasEquipment")
const DailyChecklist = use("App/Models/DailyChecklist")
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

        const equipment = await EquipmentHelpers.ALL(req)

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
            const checkDailyFleet = await DailyFleet.query()
                .with('details')
                .where('date', filterDate)
                .andWhere('shift_id', ShiftFilter.id)
                .orderBy('id', 'desc')
                .fetch()


            if(!checkDailyFleet){
                durasi = await diagnoticTime.durasi(t0)
                return response.status(404).json({
                    diagnostic: {
                        times: durasi, 
                        error: true,
                        equipment: equipment_id,
                        message: 'Daily Fleet not available...'
                    },
                    req: moment(dateReq).format('YYYY-MM-DD HH:mm:ss'),
                    data: []
                })
            }

            const dailyFleet = checkDailyFleet.toJSON()
            
            for (const item of dailyFleet) {
                for(const x of item.details){
                    equipment_id.push(x.equip_id)
                }
            }

            if(equipment_id.length === 0){
                durasi = await diagnoticTime.durasi(t0)
                return response.status(404).json({
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
            return response.status(200).json({
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
            return response.status(404).json({
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
                const checkDailyFleet = await DailyFleet
                    .query()
                    .with('details')
                    .where('id', idfleet)
                    .first()

                if(!checkDailyFleet){
                    durasi = await diagnoticTime.durasi(t0)
                    return response.status(404).json({
                        diagnostic: {
                            times: durasi, 
                            error: true,
                            message: 'Daily Fleet not available...'
                        },
                        req: moment(dateReq).format('YYYY-MM-DD HH:mm:ss'),
                        data: []
                    })
                }

                const dailyFleet = checkDailyFleet.toJSON()

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
                durasi = await diagnoticTime.durasi(t0)
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

    async lastEquipmentSMU ({ auth, params, response }) {
        var t0 = performance.now()
        const { idequip } = params
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

        const equipment = await Equipment.findOrFail(idequip)
        if(!equipment){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: false,
                    message: 'Equipment Unit Not Found...'
                },
                data: []
            })
        }

        const result = (await EquipmentHelpers.LAST_SMU(idequip)).toJSON()
        durasi = await diagnoticTime.durasi(t0)
        return response.status(201).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: result
        })
        
    }

    async equipmentEventAll ({ auth, params, request, response }) {
        var t0 = performance.now()
        const { idfleet } = params
        const req = request.only(['tgl', 'event_id', 'user_id', 'description', 'time_duration', 'total_smu'])
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

        await SAVE_EVENT_ALL_EQUIPMENT()

        async function SAVE_EVENT_ALL_EQUIPMENT(){
            const trx = await Db.beginTransaction()
            try {
                const dailyChecklist = 
                    (
                        await DailyChecklist
                        .query()
                        .where('dailyfleet_id', idfleet)
                        .andWhere('tgl', moment(req.tgl).format("YYYY-MM-DD"))
                        .fetch()
                    ).toJSON()

                let data = []
                for (const item of dailyChecklist) {
                    data.push({
                        timesheet_id: item.id,
                        event_id: req.event_id,
                        user_id: req.user_id,
                        equip_id: item.unit_id,
                        description: req.description,
                        time_duration: req.time_duration || null,
                        total_smu: req.total_smu || null
                    })
                }
                let result = await DailyEvent.createMany(data, trx)
                await trx.commit()

                const xresult = await DailyEvent.query()
                    .with('timesheet')
                    .with('event')
                    .with('equipment')
                    .with('createdby')
                    .whereIn('id', result.map(item => item.id))
                    .fetch()
                console.log(xresult);

                durasi = await diagnoticTime.durasi(t0)
                return response.status(201).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: xresult
                })
            } catch (error) {
                console.log(error)
                await trx.rollback()
                durasi = await diagnoticTime.durasi(t0)
                return response.status(403).json({
                    diagnostic: {
                        times: durasi, 
                        error: false,
                        message: error.message
                    },
                    data: []
                })
            }
        }
    }

    async equipmentEventId ({ auth, params, request, response }) {
        var t0 = performance.now()
        const { idfleet, idequip } = params
        const req = request.only(['tgl', 'event_id', 'user_id', 'description', 'time_duration', 'total_smu'])
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

        await SAVE_EVENT_EQUIPMENT_ID()

        async function SAVE_EVENT_EQUIPMENT_ID(){
            const trx = await Db.beginTransaction()
            try {
                const dailyChecklist = 
                    await DailyChecklist
                        .query(trx)
                        .where(whe => whe.where('dailyfleet_id', idfleet).andWhere('unit_id', idequip))
                        .andWhere('tgl', moment(req.tgl).format("YYYY-MM-DD"))
                        .first()

                if(!dailyChecklist){
                    durasi = await diagnoticTime.durasi(t0)
                    return response.status(404).json({
                        diagnostic: {
                            times: durasi, 
                            error: false,
                            message: 'Data Timesheet tdk ditemukan,,,, masa mau isi event tapi blum ada timesheet nya....'
                        },
                        data: dailyEvent
                    })
                }

                const dailyEvent = new DailyEvent()
                dailyEvent.fill({
                    timesheet_id: dailyChecklist.id,
                    event_id: req.event_id,
                    user_id: req.user_id,
                    equip_id: dailyChecklist.unit_id,
                    description: req.description,
                    time_duration: req.time_duration || null,
                    total_smu: req.total_smu || null
                })
                await dailyEvent.save(trx)
                
                await trx.commit()

                durasi = await diagnoticTime.durasi(t0)
                return response.status(201).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: dailyEvent
                })
            } catch (error) {
                console.log(error)
                await trx.rollback()
                durasi = await diagnoticTime.durasi(t0)
                return response.status(403).json({
                    diagnostic: {
                        times: durasi, 
                        error: false,
                        message: error.message
                    },
                    data: []
                })
            }
        }
    }

    async destroyEquipmentEventId ({ auth, params, response }) {
        var t0 = performance.now()
        const { dailyevent_id } = params
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

        await DELETE_EVENT_EQUIPMENT_ID()

        async function DELETE_EVENT_EQUIPMENT_ID(){
            const trx = await Db.beginTransaction()
            try {
                const dailyEvent = await DailyEvent.findOrFail(dailyevent_id, trx)
                await dailyEvent.delete(trx)
                await trx.commit()

                durasi = await diagnoticTime.durasi(t0)
                return response.status(201).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: dailyEvent
                })
            } catch (error) {
                console.log(error)
                await trx.rollback()
                durasi = await diagnoticTime.durasi(t0)
                return response.status(403).json({
                    diagnostic: {
                        times: durasi, 
                        error: false,
                        message: error.message
                    },
                    data: []
                })
            }
        }
    }
}

module.exports = EquipmentApiController
