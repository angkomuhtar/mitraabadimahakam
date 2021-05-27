'use strict'
const { performance } = require('perf_hooks')
const diagnoticTime = use("App/Controllers/Http/customClass/diagnoticTime")

class AuthApiController {
    async login ({request, auth, response}) {
        var t0 = performance.now()
        const { username, password } = request.all()
        try {
            const token = await auth.authenticator('jwt').attempt(username, password)
            const durasi = await diagnoticTime.durasi(t0)
            return response.status(201).json({
                data: token
            })
        } catch (error) {
            console.log(error);
            return response.status(404).json({
                data: null
            })
        }
    }

    async logout ({ auth }) {
        await auth.logout()
    }
}

module.exports = AuthApiController
