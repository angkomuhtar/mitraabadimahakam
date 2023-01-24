'use strict'

const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")
const MaterialHelpers = use("App/Controllers/Http/Helpers/Material")


class MaterialApiController {
    async index ({ auth, request, response }) {
        let durasi
        var t0 = performance.now()
        const req = request.only(['keyword'])
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
            const data = await MaterialHelpers.ALL(req)
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
            return response.status(404).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error
                },
                data: []
            })
        }
    }

    async create ({ auth, request, response }) {
        let durasi
        var t0 = performance.now()
        const req = request.only(['name', 'kode', 'tipe'])
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
            const data = await MaterialHelpers.POST(req)
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
            return response.status(404).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error
                },
                data: []
            })
        }
    }

    async show ({ auth, params, response }) {
        let durasi
        var t0 = performance.now()
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
            const data = await MaterialHelpers.GET_ID(params)
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
            return response.status(404).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error
                },
                data: []
            })
        }
    }

    async update ({ auth, params, request, response }) {
        let durasi
        var t0 = performance.now()
        const req = request.only(['name', 'kode', 'tipe'])
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
            const data = await MaterialHelpers.UPDATE(params, req)
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
            return response.status(404).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error
                },
                data: []
            })
        }
    }
}

module.exports = MaterialApiController
