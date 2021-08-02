'use strict'

const { performance } = require("perf_hooks")
const moment = require("moment")
const DailyRitaseCoalHelpers = use("App/Controllers/Http/Helpers/DailyRitaseCoal")
const DailyRitaseCoalDeatilHelpers = use("App/Controllers/Http/Helpers/DailyRitaseCoalDetail")
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const DailyRitaseCoalDetail = use("App/Models/DailyRitaseCoalDetail");

const db = use("Database")

class DailyRitaseCoalDetailApiController {
    async index ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(["keyword", "page"])
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
            const data = await DailyRitaseCoalDeatilHelpers.ALL(req)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi,
                    error: false
                },
                data: data
            })
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
    }

    // get all ritase coal details based on ritase coal id
    async getByRitID ({ auth, params, response }) {
        var t0 = performance.now()
        const { id } = params;
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
            const data = await DailyRitaseCoalDetail
            .query()
            .with('ritase_coal', a => {
                a.with('daily_fleet', aa => aa.with('pit'))
                a.with('shift')
                a.with('checker')
            })
            .with('seam')
            .with('transporter')
            .with('opr')
            .with('opr_subcon')
            .with('transporter_subcon')
            .with('checkerJT')
            .where('ritasecoal_id', id)
            .orderBy('created_at', 'asc')
            .fetch()

            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi,
                    error: false
                },
                data: data
            })
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
            const data = await DailyRitaseCoalDeatilHelpers.GET_ID(params)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi,
                    error: false
                },
                data: data
            })
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
    }

    async create ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(["ritasecoal_id", "seam_id", "dt_id", "subcondt_id", "operator", "subcon_operator", "checkout_pit", "kupon"])
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
            const data = await DailyRitaseCoalDeatilHelpers.POST(req)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi,
                    error: false
                },
                data: data
            })
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
    }

    async update ({ auth, params, request, response }) {
        var t0 = performance.now()
        const req = request.only([
            "ritasecoal_id", 
            "seam_id", 
            "dt_id", 
            "operator", 
            "checkout_pit", 
            "kupon",
            "ticket",
            "checkout_jt",
            "checkin_jt",
            "w_gross",
            "w_tare",
            "w_netto",
            "coal_tipe",
            "stockpile",
            "checker_jt"
        ])
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
            const data = await DailyRitaseCoalDeatilHelpers.UPDATE(params, req)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi,
                    error: false
                },
                data: data
            })
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
        

        try {
            const data = await DailyRitaseCoalDeatilHelpers.DELETE(params)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi,
                    error: false
                },
                data: data
            })
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
    }
}

module.exports = DailyRitaseCoalDetailApiController
