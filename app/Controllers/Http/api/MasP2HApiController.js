'use strict'

const { performance } = require('perf_hooks')
const moment = require('moment')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const MasP2H = use("App/Models/MasP2H")

class MasP2HApiController {
    async index ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['keyword', 'page'])
        const limit = 10
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
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

        let p2hItems
        if(req.keyword){
            p2hItems = 
            await MasP2H
                .query()
                .where('task', 'like', `%${req.keyword}%`)
                .andWare('sts', 'Y')
                .fetch()
                // .paginate(halaman, limit)
        }else{
            p2hItems = 
                await MasP2H
                    .query()
                    .where('sts', 'Y')
                    .fetch()
                    // .paginate(halaman, limit)
        }

        durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: p2hItems
        })
    }

    async show ({ auth, params, response }) {
        var t0 = performance.now()
        const { id } = params
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

        const p2hItems = await MasP2H.findOrFail(id)
        durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: p2hItems
        })
    }

    async create ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['task'])
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

        await SAVE_DATA()

        async function SAVE_DATA(){
            const masP2H = new MasP2H()
            masP2H.fill(req)
            try {
                await masP2H.save()
                durasi = await diagnoticTime.durasi(t0)
                return response.status(201).json({
                    diagnostic: {
                        times: durasi,
                        error: false,
                    },
                    data: masP2H
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
                    data: []
                })
            }
        }
    }
}

module.exports = MasP2HApiController
