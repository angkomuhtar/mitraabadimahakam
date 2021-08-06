'use strict'

const { performance } = require("perf_hooks")
const moment = require("moment")
const DailyRitaseCoal = use("App/Models/DailyRitaseCoal")
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

    // show data based today and previous day
    async filterByDate ({ auth, request, response }) {
        var t0 = performance.now()
        const { begin_date, end_date } = request.only(["begin_date", "end_date"])
    
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

        const d1 = moment(begin_date).startOf('day').format('YYYY-MM-DD HH:mm:ss') // from
        const d2 = moment(end_date).endOf('day').format('YYYY-MM-DD HH:mm:ss'); // to

        console.log(d1, d2);
        // const prevDay = moment(date).subtract(1, 'days').format('YYYY-MM-DD');

        try {
            const dailyRitase = await DailyRitaseCoal
            .query()
            .with('checker')
            .with('shift')
            .with('daily_fleet', details => {
                details.with('details', unit => unit.with('equipment'))
                details.with('activities')
                details.with('fleet')
                details.with('pit')
            })
            .where("status", "Y")
            .whereBetween('date', [d1, d2])
            .orderBy('created_at', 'desc')
            .fetch()
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

    async create ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(["dailyfleet_id", "checker_id", "shift_id", "distance", "block", "date"]);
        const { dailyfleet_id, distance, block } = req;

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
        

        const checkIfExist = await DailyRitaseCoal
            .query()
            .where(w => {
                w.where('distance', distance)
                w.where('dailyfleet_id', dailyfleet_id)
                w.where('block', block)
            })
            .first()

        if(checkIfExist) {
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: true,
                    message: 'Data Already Exist'
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

    async update ({ auth, params, request, response }) {
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
        const isDailyRitaseCoal = await db.table('daily_ritase_coals').where('id', params.id).first()
        if(!isDailyRitaseCoal){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: true,
                    message: 'Daily Ritase Coal undefined...',
                },
                data: [],
            })
        }

        try {
            const data = await DailyRitaseCoalHelpers.UPDATE(params, req)
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

    async destroy ({ auth, params, response }) {
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

        const isDailyRitaseCoal = await db.table('daily_ritase_coals').where('id', params.id).first()
        if(!isDailyRitaseCoal){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi,
                    error: true,
                    message: 'Daily Ritase Coal undefined...',
                },
                data: [],
            })
        }

        try {
            const data = await DailyRitaseCoalHelpers.DELETE(params)
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
