'use strict'

// const User = use('App/Models/User')
const Database = use('Database');


class AuthApiController {
    async login({ request, auth, response }) {
        const { username, password } = request.all();

        try {
            const token = await auth.authenticator('jwt').attempt(username, password);
            const userRole = (await Database
                .from('users')
                .where('username', username)
                .select('user_tipe'))[0].user_tipe

            const usernameQuery = (await Database
                .raw('select me.fullname from users u, profiles p, mas_employees me where p.user_id = u.id && p.employee_id = me.id && u.username = ?', [username]))

            const userFullName = usernameQuery[0][0].fullname

            return response.status(201).json({
                data: token,
                userRole,
                fullname: userFullName
            });

        } catch (error) {
            console.log(error);
            return response.status(404).json({
                data: null,
                userRole: null,
                fullname: null
            })
        }
    }
}

module.exports = AuthApiController
