'use strict'

const Options = use("App/Models/SysOption")

class UserController {
    async index ({auth, view, request, response}) {
        const usr = await auth.getUser()
        const user_tipe = (await Options.query().where('group', 'user-tipe').fetch()).toJSON()
        const sex = (await Options.query().where('group', 'sex').fetch()).toJSON()
        return view.render('master.user.index', {
            select: user_tipe,
            sex: sex,
        })
    }
}

module.exports = UserController
