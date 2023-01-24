'use strict'

const Profile = use("App/Models/Profile")
const VUser = use("App/Models/VUser")
const SysUserApp = use("App/Models/SysUserApp")
const moment = require('moment')

class WelcomeController {
    async index ({view, auth, response}) {
        
        let usr
        try {
            await auth.check()
            usr = await auth.getUser()
        } catch (error) {
            console.log(error);
            return response.route('login')
        }

        let listBulan = []

        var m = moment();
        for (var i = 0; i < 12; i++) {
            listBulan.push({
                name: m.month(i).format('MMMM YYYY'),
                values: m.month(i).format('YYYY-MM')
            })
        }

        listBulan = listBulan.map(item => item.values === moment().format('YYYY-MM') ? {...item, selected: 'selected'} : {...item, selected: ''})

        return view.render('welcome', {monthItem: listBulan})
    }

    async check () {
        const sysUserApp = (await SysUserApp.all()).toJSON()
        return sysUserApp[0]
    }

    async jsonData ({}) {
        const user = (
            await VUser.query()
            .with('user_menu')
            .with('user_menuDetail')
            .first()
        ).toJSON()
        const {user_menu, user_menuDetail} = user
        const data = user_menu.map(elm => {
            return {
                ...elm,
                submenu: user_menuDetail.filter(fill => fill.menu_id === elm.id)
            }
        })
        return data
    }
}

module.exports = WelcomeController

async function userValidate(auth){
    let user
    try {
        user = await auth.getUser()
        return user
    } catch (error) {
        console.log(error);
        return null
    }
}