'use strict'

const v_Akses = use("App/Models/VPrivilege")
const Module = use("App/Models/SysModule")

class SysUserAkseController {
    async index ({auth, request, view}) {
        const usr = await auth.getUser()
        // const user = await v_Akses.query().where('usertipe', usr.user_tipe).fetch()
        // console.log(user.toJSON());
        return view.render('setting.usr-akses.index')
    }
}

module.exports = SysUserAkseController
