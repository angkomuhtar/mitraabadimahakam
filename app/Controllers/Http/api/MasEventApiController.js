'use strict'

// CustomClass
// const moment = require('moment')
const { performance } = require('perf_hooks')
const _ = require('underscore')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const MasEvent = use("App/Models/MasEvent")

class MasEventApiController {
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

        await GET_DATA()

        async function GET_DATA(){
            let data
            try {
                if(req.keyword){
                    data = (
                        await MasEvent
                        .query()
                        .where(w => {
                            w.where('kode', 'like', `%${req.keyword}%`)
                            .orWhere('narasi', 'like', `%${req.keyword}%`)
                        })
                        .andWhere('aktif', 'Y')
                        .fetch()
                    ).toJSON()
                }else{
                    data = (
                        await MasEvent
                        .query()
                        .where('aktif', 'Y')
                        .fetch()
                    ).toJSON()
                }

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
    }

    async show ({ auth, params, response }) {
        let durasi
        var t0 = performance.now()
        const { id } = params
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

        await GET_DATA()

        async function GET_DATA(){
            let data
            try {
                data = (await MasEvent.query().where({id}).first()).toJSON()
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

    async create ({ auth, request, response }) {
        let durasi
        var t0 = performance.now()
        const req = request.all()
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

        await SAVE_DATA()

        async function SAVE_DATA(){
            const masEvent = new MasEvent()
            masEvent.fill(req)
            try {
                await masEvent.save()
                durasi = await diagnoticTime.durasi(t0)
                return response.status(201).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: masEvent
                })
            } catch (error) {
                console.log(error)
                durasi = await diagnoticTime.durasi(t0)
                return response.status(403).json({
                    diagnostic: {
                        times: durasi, 
                        error: false,
                        message: error
                    },
                    data: []
                })
            }
        }
    }

    async update ({ auth, params, request, response }) {
        let durasi
        const { id } = params
        const req = request.only(['narasi', 'satuan', 'engine', 'aktif'])
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

        await UPDATE_DATA()

        async function UPDATE_DATA(){
            try {
                const masEvent = await MasEvent.findOrFail(id)
                masEvent.merge(req)
                await masEvent.save()
                durasi = await diagnoticTime.durasi(t0)
                return response.status(201).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: masEvent
                })
            } catch (error) {
                console.log(error)
                durasi = await diagnoticTime.durasi(t0)
                return response.status(403).json({
                    diagnostic: {
                        times: durasi, 
                        error: false,
                        message: error
                    },
                    data: []
                })
            }
        }
    }
}

module.exports = MasEventApiController
