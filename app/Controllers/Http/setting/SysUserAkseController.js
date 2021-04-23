'use strict'

const v_Akses = use("App/Models/VPrivilege")
const Options = use("App/Models/SysOption")

class SysUserAkseController {
    async index ({ auth, request, view }) {
        return view.render('setting.usr-akses.index')
    }

    async list ({ auth, request, view }) {
        const usr = await auth.getUser()
        const req = request.all()
        let whe = req.keyword ? builder => {
            builder.where('usertipe', 'like', `%${req.keyword}%`)
            builder.orWhere('nm_module', 'like', `%${req.keyword}%`)
        } : {}
        let option = (await Options.query().where({group: "user-tipe"}).fetch()).toJSON()
        const akses = (await v_Akses.query().where(whe).fetch()).toJSON()
        option = option.map(el => {
            return {
                ...el,
                details: akses.filter(fil => fil.usertipe === el.nilai)
            }
        })
        // console.log(akses);
        return view.render('setting.usr-akses.list', {data: option})
    }
}

module.exports = SysUserAkseController
