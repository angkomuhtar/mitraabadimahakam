'use strict'

// CustomClass
const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")

const Db = use('Database')
const _ = require('underscore')
const v_Akses = use("App/Models/VPrivilege")
const Options = use("App/Models/SysOption")
const SysModule = use("App/Models/SysModule")

class SysUserAkseController {
    async index ({ auth, request, view }) {
        let option = (await Options.query().where({group: "user-tipe"}).fetch()).toJSON()
        let sysmodule = (await SysModule.query().orderBy('method', 'asc').fetch()).toJSON()
        return view.render('setting.usr-akses.index', {usertipe: option, listmodule: sysmodule})
    }

    async list ({ auth, request, view }) {
        const usr = await auth.getUser()
        const req = request.all()
        // let whe = req.keyword ? builder => {
        //     builder.where('usertipe', 'like', `%${req.keyword}%`)
        //     builder.orWhere('nm_module', 'like', `%${req.keyword}%`)
        // } : {}
        // let option = (await Options.query().where({group: "user-tipe"}).fetch()).toJSON()
        // const akses = (await v_Akses.query().where(whe).fetch()).toJSON()
        // option = option.map(el => {
        //     return {
        //         ...el,
        //         details: akses.filter(fil => fil.usertipe === el.nilai)
        //     }
        // })
        // new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()

        let access = (await v_Akses.query().where('aktif', 'Y').distinct().fetch()).toJSON()
        
        access = _.groupBy(access, 'usertipe')
        access = Object.keys(access).map(key => {
            let subitems = access[key]
            
            return {
                usertype: key,
                items: subitems
            }
        })

        let result = []
        for (const obj of access) {
            let data = _.groupBy(obj.items, 'nm_module')
            data = Object.keys(data).map(key => {
                return {
                    name: key,
                    items: data[key]
                }
            })
            // console.log(data);
            result.push({
                usertype: obj.usertype,
                items: data
            })
        }

        console.log(JSON.stringify(result, null, 2));
        return view.render('setting.usr-akses.list', {data: result})
    }

    async store ({ auth, request }) {
        const usr = await auth.getUser()
        const req = request.only(['user_tipe'])
        const reqCol = request.collect(['mod_id'])
        const data = reqCol.map(el => {
            return {
                ...el,
                user_tipe: req.user_tipe
            }
        })
        try {
            if(req.user_tipe != null){
                await Db.table('sys_users_groups').where({user_tipe: req.user_tipe}).delete()
                await Db.from('sys_users_groups').insert(data)
                new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
                return {
                    success: true,
                    message: 'Success Grant User Privilege'
                }
            }
        } catch (error) {
            console.log(error)
            new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
            return {
                success: false,
                message: 'Failed Grant User Privilege'
            }
        }
    }
}

module.exports = SysUserAkseController
