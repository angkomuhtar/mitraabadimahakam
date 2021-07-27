'use strict'

const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const SubcontHelpers = use("App/Controllers/Http/Helpers/Subcontractor")

class SubconApiController {
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

        try {
            const subcon = (await SubcontHelpers.SUBCONT_LIST(req)).toJSON()
            let durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: subcon
            })
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
    }

    async show ({ auth, params, response }) {
        var t0 = performance.now()
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
                data: {}
            })
        }

        try {
            const data = await SubcontHelpers.SUBCONT_SHOW(params)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
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
                    message: error.message
                },
                data: {}
            })
        }
    }

    async showEquipment ({ auth, params, response }) {
        var t0 = performance.now()
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
                data: {}
            })
        }

        try {
            const data = await SubcontHelpers.SUBCON_EQUIPMENT(params)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(200).json({
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
                    message: error.message
                },
                data: {}
            })
        }
    }
}

module.exports = SubconApiController
