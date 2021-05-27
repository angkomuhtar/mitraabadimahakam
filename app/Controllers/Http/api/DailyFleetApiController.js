'use strict'
const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const Fleet = use("App/Models/MasFleet")
const DailyFleet = use("App/Models/DailyFleet")

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
}

module.exports = DailyFleetApiController
