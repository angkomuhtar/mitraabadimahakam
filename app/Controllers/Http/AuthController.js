'use strict'

const SysError = use("App/Models/SysError")
const Token = use("App/Models/Token")

class AuthController {
    async index ({view, auth, response}) {
        try {
            await auth.check()
            return response.redirect('/')
        } catch (error) {
            console.log('error ', error);
            return response.route('login')
        }
    }

    async show ({view, auth, response}) {
        try {
            await auth.check()
            return response.redirect('back')
        } catch (error) {
            return view.render('login')
        }
    }

    async login ({ request, auth, response, session }) {
        const { username, password } = request.all()
        try {
            await auth.remember(true).attempt(username, password)
            const usr = await auth.getUser()
            console.log('usr ', usr);
            if(usr.status != 'Y'){
                await auth.logout()
                session.flash({loginError: 'User Status Inactive...'})
                return response.redirect('/login')
            }
            else{
                return response.redirect('/')
            }
        } catch (error) {
            console.log('error.code ', error)
            const syserror = new SysError()
            syserror.fill({name: error.code || 'E_LOGIN', message: error.sqlMessage, description: 'E_INVALID_SESSION', error_by: null})
            await syserror.save()
            session.flash({loginError: 'Authorization Failed...'})
            return response.redirect('/login')
        }
    }

    async loggingOut ({auth, response}) {
        const usr = await auth.getUser()
        await Token.query().where('user_id', usr.id).delete()
        await auth.logout()
        return response.redirect('/login')
    }
}

module.exports = AuthController
