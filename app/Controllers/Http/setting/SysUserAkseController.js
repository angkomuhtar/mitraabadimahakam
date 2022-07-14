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
        const modules = await GetSysModules()
        return view.render('setting.usr-akses.index', {
            usertipe: option,
            module: modules
        })
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
        const req = request.all()
        req.createCb = req.createCb ? 'C':null
        req.readCb = req.readCb ? 'R':null
        req.updateCb = req.updateCb ? 'U':null
        req.deleteCb = req.deleteCb ? 'D':null
        
        console.log(req);

        // Create Access Data
        const sysModuleCreate = await SysModule.query().where( w => {
            w.where('method', req.createCb)
            w.where('name', req.nm_module)
            w.where('aktif', 'Y')
        }).last()

        if(sysModuleCreate){
            const userGroup = await Db.table('sys_users_groups').where({
                mod_id: sysModuleCreate.id,
                user_tipe: req.user_tipe,
            }).first() || null
            
            if(userGroup){
                return {
                    success: false,
                    message: 'User '+ req.user_tipe +' telah memiliki akses create data...'
                }
            }else{
                await Db.insert({mod_id: sysModuleCreate.id, user_tipe: req.user_tipe}).into('sys_users_groups')
            }
        }

        // Create Read Data
        const sysModuleRead = await SysModule.query().where( w => {
            w.where('method', req.readCb)
            w.where('name', req.nm_module)
            w.where('aktif', 'Y')
        }).last()

        if(sysModuleRead){
            const userGroup = await Db.table('sys_users_groups').where({
                mod_id: sysModuleRead.id,
                user_tipe: req.user_tipe,
            }).first() || null
            
            if(userGroup){
                return {
                    success: false,
                    message: 'User '+ req.user_tipe +' telah memiliki akses create data...'
                }
            }else{
                await Db.insert({mod_id: sysModuleRead.id, user_tipe: req.user_tipe}).into('sys_users_groups')
            }
        }

        // Create Update Data
        const sysModuleUpdate = await SysModule.query().where( w => {
            w.where('method', req.updateCb)
            w.where('name', req.nm_module)
            w.where('aktif', 'Y')
        }).last()

        if(sysModuleUpdate){
            const userGroup = await Db.table('sys_users_groups').where({
                mod_id: sysModuleUpdate.id,
                user_tipe: req.user_tipe,
            }).first() || null
            
            if(userGroup){
                return {
                    success: false,
                    message: 'User '+ req.user_tipe +' telah memiliki akses Update data...'
                }
            }else{
                await Db.insert({mod_id: sysModuleUpdate.id, user_tipe: req.user_tipe}).into('sys_users_groups')
            }
        }

        // Create Delete Data
        const sysModuleDelete = await SysModule.query().where( w => {
            w.where('method', req.deleteCb)
            w.where('name', req.nm_module)
            w.where('aktif', 'Y')
        }).last()

        if(sysModuleDelete){
            const userGroup = await Db.table('sys_users_groups').where({
                mod_id: sysModuleDelete.id,
                user_tipe: req.user_tipe,
            }).first() || null
            
            if(userGroup){
                return {
                    success: false,
                    message: 'User '+ req.user_tipe +' telah memiliki akses Update data...'
                }
            }else{
                await Db.insert({mod_id: sysModuleDelete.id, user_tipe: req.user_tipe}).into('sys_users_groups')
            }
        }

        return {
            success: true,
            message: 'User '+ req.user_tipe +' berhasil diberikan akses...'
        }
    }

    async destroy ( { request } ) {
        const req = request.all()
        console.log(req);
        const sysModule = (await SysModule.query().where('name', req.nm_modul).fetch()).toJSON()

        for (const obj of sysModule) {
            await Db.table('sys_users_groups').where({user_tipe: req.usertipe, mod_id: obj.id}).delete()
        }
        return {
            success: true,
            message: 'User '+ req.usertipe +' berhasil hilangkan aksesnya...'
        }
    }

}

module.exports = SysUserAkseController


async function GetSysModules(){
    let sysmodule = (await SysModule.query().orderBy('method', 'asc').fetch()).toJSON()
    sysmodule = _.groupBy(sysmodule, 'name')
    sysmodule = Object.keys(sysmodule).map(key => {
        return {
            name: key,
            title: key.toLocaleUpperCase(),
            items: sysmodule[key]
        }
    })
    // console.log(sysmodule);
    return sysmodule
}