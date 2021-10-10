'use strict'

const Hash = use('Hash')
const { performance } = require('perf_hooks')
const UserApiController = require('./UserApiController')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const User = use("App/Models/User")
const Token = use("App/Models/Token")
const userx = use("App/Models/VUser")

class AuthApiController {
    async login ({request, auth, response}) {
        var t0 = performance.now()
        const { username, password } = request.all()
        let durasi
        try {
            const token = await auth.authenticator('jwt').newRefreshToken().attempt(username, password)
            const usr = await userx.findBy('username', username)
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi, 
                    error: false,
                },
                data: token,
                user: usr.toJSON()
            })
        } catch (error) {
            console.log(error);
            durasi = await diagnoticTime.durasi(t0)
            return response.status(404).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: error.message
                },
                data: null
            })
        }
    }

    async updatePassword ({ request, auth, response }) {
        var t0 = performance.now()
        const req = request.only(['username', 'old_password', 'new_password', 'retype_password'])
        let durasi

        if(req.new_password != req.retype_password){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(400).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: 'password not match...'
                }
            })
        }

        try {
            const user = await auth.authenticator('jwt').getUser()
            const verifyPassword = await Hash.verify(
                req.old_password,
                user.password
            )

            if (!verifyPassword) {
                durasi = await diagnoticTime.durasi(t0)
                return response.status(400).json({
                    diagnostic: {
                        times: durasi, 
                        error: true,
                        message: 'Current password could not be verified! Please try again.'
                    }
                })
            }

            const usr = await User.findOrFail(user.id)
            usr.password = req.new_password
            await usr.save()
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi, 
                    error: false,
                    message: 'Password updated!'
                }
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

    async updatePasswordWithoutOldPassword ({ request, auth, response }) {
        var t0 = performance.now()
        const req = request.only(['user_id', 'new_password', 'retype_password'])
        let durasi;

        if(req.new_password != req.retype_password){
            durasi = await diagnoticTime.durasi(t0)
            return response.status(400).json({
                diagnostic: {
                    times: durasi, 
                    error: true,
                    message: 'password not match...'
                }
            })
        }

        try {

            const usr = await User.findOrFail(req.user_id)
            usr.password = req.new_password
            await usr.save()
            durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                diagnostic: {
                    times: durasi, 
                    error: false,
                    message: 'Password updated!'
                }
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

    async logout ({ auth, response }) {
        try {
            const user = await auth.authenticator('jwt').getUser()
            await Token.query().where('user_id', user.id).delete()
            await auth.logout()
            return response.status(200).json({
                diagnostic: {
                    error: false,
                    message: 'Logout Success...'
                },
                data: {token: null},
            })
            
        } catch (error) {
            console.log(error)
            return response.status(200).json({
                diagnostic: {
                    error: false,
                    message: error
                }
            })
        }
    }
}

module.exports = AuthApiController
