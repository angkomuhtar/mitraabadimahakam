'use strict'

const { performance } = require("perf_hooks")
const moment = require("moment")
const DailyRitaseCoalHelpers = use("App/Controllers/Http/Helpers/DailyRitaseCoal")
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const db = use("Database")

class DailyRitaseCoalApiController {
    async index({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(["keyword", "page"])
    
        try {
            await auth.authenticator("jwt").getUser()
        } catch (error) {
            console.log(error)
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: true,
                    message: error.message,
                },
                data: [],
            })
        }
    
        try {
            const dailyRitase = await DailyRitaseCoalHelpers.ALL(req)
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi,
                    error: false,
                },
                data: dailyRitase,
            })
        } catch (error) {
            console.log(error)
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: true,
                    message: error
                },
                data: [],
            })
        }
    }

    async show ({ auth, params, response }) {
        var t0 = performance.now()
        let durasi
    
        try {
            await auth.authenticator("jwt").getUser()
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: true,
                    message: error.message,
                },
                data: [],
            })
        }

        try {
            const dailyRitase = await DailyRitaseCoalHelpers.GET_ID(params)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi,
                    error: false,
                },
                data: dailyRitase,
            })
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: true,
                    message: error
                },
                data: [],
            })
        }
    }

    async create ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(["dailyfleet_id", "checker_id", "shift_id", "distance", "block", "date"])
        let durasi
    
        try {
            await auth.authenticator("jwt").getUser()
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: true,
                    message: error.message,
                },
                data: [],
            })
        }

        const isDailyFleet = await db.table('daily_fleets').where('id', req.dailyfleet_id).first()
        if(!isDailyFleet){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: true,
                    message: 'Daily Fleet undefined...',
                },
                data: [],
            })
        }

        try {
            const data = await DailyRitaseCoalHelpers.POST(req)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi,
                    error: false,
                },
                data: data,
            })
        } catch (error) {
            console.log(error)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: true,
                    message: error
                },
                data: [],
            })
        }
    }
}

module.exports = DailyRitaseCoalApiController
