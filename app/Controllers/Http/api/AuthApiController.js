'use strict'
const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

const userx = use("App/Models/VUser")

class AuthApiController {
    async login ({request, auth, response}) {
        var t0 = performance.now()
        const { username, password } = request.all()
        let durasi
        try {
            const token = await auth.authenticator('jwt').attempt(username, password)
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

    async logout ({ auth }) {
        await auth.logout()
    }
}

module.exports = AuthApiController
