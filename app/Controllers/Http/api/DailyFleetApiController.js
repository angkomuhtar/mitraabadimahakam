'use strict'
const { performance } = require('perf_hooks')
const moment = require('moment')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

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
        // const reqDetail = request.collect(['equip_id', 'datetime'])
        var t0 = performance.now()
        let durasi
        try {
            await auth.authenticator('jwt').getUser()
            await resData()
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: {}
            })
        }

        async function resData(){
            const { details } = req
            for (const item of details) {
                const begin = moment(item.datetime).format('YYYY-MM-DD 00:00')
                const end = moment(item.datetime).format('YYYY-MM-DD 23:59')
                const cekEquipment = await DailyFleetEquip.query().whereBetween('datetime',  [begin, end]).andWhere('equip_id', item.equip_id).first()
                if(cekEquipment){
                    return response.status(200).json({
                        diagnostic: {
                            times: durasi, 
                            error: true
                        },
                        data: cekEquipment
                    })
                }
            }
            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: details
            })
        }
    }
}

module.exports = DailyFleetApiController
