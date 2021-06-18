'use strict'

const Helpers = use('Helpers')
const { performance } = require('perf_hooks')
const cryptoRandomString = require('crypto-random-string')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const Profile = use("App/Models/Profile")

class ProfileApiController {
    async index ({ auth, request, response }) {
        var t0 = performance.now()
        const req = request.only(['keyword', 'page'])
        const limit = 20
        const halaman = req.page === undefined ? 1:parseInt(req.page)
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

        await GET_ALL_PROFILE()

        async function GET_ALL_PROFILE(){
            try {
                let profile
                if(req.keyword){
                    profile = await Profile
                        .query()
                        .with('user')
                        .with('employee')
                        .where(whe => {
                            whe.where('nm_depan', 'like', `%${req.keyword}%`)
                            whe.orWhere('nm_belakang', 'like', `%${req.keyword}%`)
                            whe.orWhere('phone', 'like', `%${req.keyword}%`)
                          })
                        .paginate(halaman, limit)
                }else{
                    profile = await Profile.query().with('user').with('employee').paginate(halaman, limit)
                }
    
                durasi = await diagnoticTime.durasi(t0)
                return response.status(200).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: profile
                })
            } catch (error) {
                console.log(error)
                durasi = await diagnoticTime.durasi(t0)
                return response.status(200).json({
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

        await GET_ID_PROFILE()

        async function GET_ID_PROFILE(){
            try {
                const profile = await Profile.query().with('user').with('employee').where('id', id).first()
                durasi = await diagnoticTime.durasi(t0)
                return response.status(200).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: profile
                })
            } catch (error) {
                console.log(error)
                durasi = await diagnoticTime.durasi(t0)
                return response.status(200).json({
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

    async update ({ auth, params, request, response }) {
        var t0 = performance.now()
        const { id } = params
        const req = request.only(['nm_depan', 'nm_belakang', 'phone', 'jenkel'])
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

        let profile = await Profile.findOrFail(id)
        if(!profile){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: 'Resource not found...'
                },
                data: {}
            })
        }

        try {
            profile.merge(req)
            await profile.save()
            durasi = await diagnoticTime.durasi(t0)
            return response.status(403).json({
                diagnostic: {
                    times: durasi, 
                    error: false
                },
                data: profile
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
                data: {}
            })
        }
    }

    async uploadAvatar ({ auth, params, request, response }){
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

        const profileAvatar = {
            types: ["image"],
            size: "10mb",
            extnames: ['jpg', 'png', 'jpeg'],
        }

        const imgAvatar = request.file("avatar", profileAvatar)

        if(imgAvatar){
            const randURL = await cryptoRandomString({length: 30, type: 'url-safe'})
            const aliasName = `${randURL}.${imgAvatar.extname}`
            var uriAvatar = '/avatar/'+aliasName
            await imgAvatar.move(Helpers.publicPath(`avatar`), {
                name: aliasName,
                overwrite: true,
            })

            if (!imgAvatar.moved()) {
                return imgAvatar.error()
            }
            
            const profile = await Profile.findOrFail(id)
            try {
                profile.merge({avatar: uriAvatar})
                await profile.save()
                durasi = await diagnoticTime.durasi(t0)
                return response.status(403).json({
                    diagnostic: {
                        times: durasi, 
                        error: false
                    },
                    data: profile
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
                    data: {}
                })
            }
        }

        return response.status(403).json({
            diagnostic: {
                times: durasi, 
                error: true,
                message: "Image invalid..."
            },
            data: {}
        })
    }
}

module.exports = ProfileApiController
