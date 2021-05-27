'use strict'
const { performance } = require('perf_hooks')
const moment = require('moment')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const db = use('Database')
const Fleet = use("App/Models/MasFleet")
const DailyFleet = use("App/Models/DailyFleet")
const DailyFleetEquip = use("App/Models/DailyFleetEquip")

class DailyFleetApiController {
    async index ({ auth, request, response }) {
        var t0 = performance.now()
        // const req = request.only(['keyword'])

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

        const dailyFleet = 
            await DailyFleet
                .query()
                .with('pit')
                .with('fleet')
                .with('activities')
                .with('shift')
                .with('user')
                .fetch()

        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: dailyFleet
        })
    }

    async show ({ auth, params, request, response }) {
        const { id } = params
        const req = request.only(['keyword'])
        var t0 = performance.now()
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

        let dailyFleet
        if(req.keyword){
            dailyFleet = await DailyFleet
                .query()
                .with('pit', a => {
                    a.where('kode', 'like', `%${req.keyword}%`)
                    a.orWhere('name', 'like', `%${req.keyword}%`)
                    a.orWhere('location', 'like', `%${req.keyword}%`)
                })
                .with('fleet', b => {
                    b.where('kode', 'like', `%${req.keyword}%`)
                    b.orWhere('name', 'like', `%${req.keyword}%`)
                })
                .with('activities', c => {
                    c.where('kode', 'like', `%${req.keyword}%`)
                    c.orWhere('name', 'like', `%${req.keyword}%`)
                    c.orWhere('keterangan', 'like', `%${req.keyword}%`)
                })
                .with('shift', d => {
                    d.where('kode', 'like', `%${req.keyword}%`)
                    d.orWhere('name', 'like', `%${req.keyword}%`)
                    d.orWhere('duration', 'like', `%${req.keyword}%`)
                })
                .with('user')
                .with('details', e => e.with('equipment'))
                .where({id: id})
                .first()
        }else{
            dailyFleet = await DailyFleet
                .query()
                .with('pit')
                .with('fleet')
                .with('activities')
                .with('shift')
                .with('user')
                .with('details', e => e.with('equipment'))
                .where({id: id})
                .first()
        }

        let durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: dailyFleet
        })
    }

    async create ({ auth, request, response }) {
        const req = request.only(['pit_id', 'fleet_id', 'activity_id', 'shift_id', 'date', 'details'])
        var t0 = performance.now()
        let durasi
        try {
            const usr = await auth.authenticator('jwt').getUser()
            await resData(usr)
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

        async function resData(usr){
            const { details } = req
            const { pit_id, fleet_id, activity_id, shift_id, date } = req
            const cekFleet = await DailyFleet.query().where({pit_id, fleet_id, activity_id, shift_id, date}).first()
            
            if(cekFleet){
                durasi = await diagnoticTime.durasi(t0)
                return response.status(200).json({
                    diagnostic: {
                        times: durasi, 
                        error: true,
                        message: 'Fleet exsisting...'
                    },
                    data: cekFleet
                })
            }

            for (const item of details) {
                const begin = moment(item.datetime).format('YYYY-MM-DD 00:00')
                const end = moment(item.datetime).format('YYYY-MM-DD 23:59')
                const cekEquipment = await DailyFleetEquip.query().whereBetween('datetime',  [begin, end]).andWhere('equip_id', item.equip_id).first()
                if(cekEquipment){
                    durasi = await diagnoticTime.durasi(t0)
                    return response.status(200).json({
                        diagnostic: {
                            times: durasi, 
                            error: true,
                            message: 'duplicated equipment or datetime'
                        },
                        data: cekEquipment
                    })
                }
            }

            const trx = await db.beginTransaction()
            try {
                const dailyFleet = new DailyFleet()
                dailyFleet.fill({
                    pit_id, 
                    fleet_id, 
                    activity_id, 
                    shift_id, 
                    user_id: usr.id,
                    date: new Date(date)
                })
                await dailyFleet.save(trx)

                const dailyFleetEquip = new DailyFleetEquip()
                for (const item of details) {
                    dailyFleetEquip.fill({
                        dailyfleet_id: dailyFleet.id,
                        equip_id: item.equip_id,
                        datetime: item.datetime
                    })
                }
                await dailyFleetEquip.save(trx)
                await trx.commit()
                durasi = await diagnoticTime.durasi(t0)
                return response.status(200).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: dailyFleet
                })
            } catch (error) {
                console.log(error)
                await trx.rollback()
                return response.status(404).json({
                    diagnostic: {
                        times: durasi, 
                        error: true,
                        message: 'Failed post'
                    },
                    data: []
                })
            }
        }
    }

    async update ({auth, params, request, response}) {
        const { id } = params
        const req = request.only(['pit_id', 'fleet_id', 'activity_id', 'shift_id', 'date', 'details'])
        var t0 = performance.now()
        let durasi
        try {
            const usr = await auth.authenticator('jwt').getUser()
            const dailyFleet = await DailyFleet.query().where('id', id).with('details').first()

            // console.log(dailyFleet.toJSON());
            await resData(usr, req)
            
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

        async function resData(usr, data){
            
            const { pit_id, fleet_id, activity_id, shift_id, date, details } = req

            let dailyFleetEquip
            for (const item of data.details) {
                const begin = moment(item.datetime).format('YYYY-MM-DD 00:00')
                const end = moment(item.datetime).format('YYYY-MM-DD 23:59')
                dailyFleetEquip = await DailyFleetEquip.query()
                    .whereBetween('datetime', [begin, end])
                    .andWhere('equip_id', item.equip_id)
                    .first()

                console.log(dailyFleetEquip)
            }

            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: false
                },
                data: dailyFleetEquip
            })
        }
    }
}

module.exports = DailyFleetApiController
