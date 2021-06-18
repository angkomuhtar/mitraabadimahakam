'use strict'

const { performance } = require('perf_hooks')
// const moment = require('moment')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const ViewUser = use("App/Models/VUser")

class UserApiController {
    async index ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['keyword', 'page'])
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

        let users
        if(req.keyword){
            users = 
            await ViewUser
                .query()
                .where(filter => {
                    filter.where('user_tipe', 'like', `%${req.keyword}%`)
                    .orWhere('nm_lengkap', 'like', `%${req.keyword}%`)
                    .orWhere('phone', 'like', `%${req.keyword}%`)
                    .orWhere('email', 'like', `%${req.keyword}%`)
                })
                .andWhere('status', 'Y')
                .select('id', 'email', 'user_tipe', 'nm_lengkap', 'jenkel', 'phone')
                .fetch()
        }else{
            users = 
                await ViewUser
                    .query()
                    .where('status', 'Y')
                    .select('id', 'email', 'user_tipe', 'nm_lengkap', 'jenkel', 'phone')
                    .fetch()
        }

        durasi = await diagnoticTime.durasi(t0)
        return response.status(200).json({
            diagnostic: {
                times: durasi, 
                error: false
            },
            data: users
        })
    }

    async search ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.all()
        let durasi

        try {
            await auth.authenticator('jwt').getUser()
            await SERACH_DATA()
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

        async function SERACH_DATA(){
            try {
                const users = await ViewUser
                    .query()
                    .where('status', 'Y')
                    .andWhere(req)
                    .select('id', 'email', 'user_tipe', 'nm_lengkap', 'jenkel', 'phone')
                    .fetch()
                durasi = await diagnoticTime.durasi(t0)
                return response.status(200).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: users
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
    }

    async show ({ auth, params, response }) {
        var t0 = performance.now()
        const { id } = params
        let durasi

        try {
            await auth.authenticator('jwt').getUser()
            await GET_DATA()
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

        async function GET_DATA(){
            try {
                const user = await ViewUser.findOrFail(id)
                durasi = await diagnoticTime.durasi(t0)
                return response.status(201).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: user
                })
            } catch (error) {
                durasi = await diagnoticTime.durasi(t0)
                return response.status(404).json({
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

    
}

module.exports = UserApiController
