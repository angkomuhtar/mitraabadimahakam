'use strict'

const { performance } = require('perf_hooks')
const moment = require('moment')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const db = use('Database')
const DailyRitase = use("App/Models/DailyRitase")

class DailyRitaseApiController {
    async index ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['keyword', 'page'])
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)

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

        try {
            let dailyRitase
            if(req.keyword){
                dailyRitase = await DailyRitase.query().where('status', 'Y').paginate(halaman, limit)
            }else{
                dailyRitase = await DailyRitase.query().where('status', 'Y').paginate(halaman, limit)
            }
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: dailyRitase
            })
        } catch (error) {
            console.log(error)
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true
                },
                data: []
            })
        }
    }

    async create ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['dailyfleet_id', 'checker_id', 'spv_id', 'material', 'distance', 'hauler_id'])

        try {
            await auth.authenticator('jwt').getUser()
            await SAVE_DATA()
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

        async function SAVE_DATA(){
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi, 
                    error: true
                },
                data: req
            })
        }
    }
}

module.exports = DailyRitaseApiController
