'use strict'

class AuthApiController {
    async login ({request, auth, response}) {
        const { username, password } = request.all()
        try {
            const token = await auth.authenticator('jwt').attempt(username, password)
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
}

module.exports = AuthApiController
