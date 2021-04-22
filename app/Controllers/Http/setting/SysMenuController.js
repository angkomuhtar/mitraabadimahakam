'use strict'


const Loggerx = use("App/Controllers/Http/customClass/LoggerClass")
var moment = require('moment')

const Db = use('Database')
const User = use("App/Models/User")
const Menu = use("App/Models/SysMenu")
const SubMenu = use("App/Models/SysMenuDetail")

class SysMenuController {
  async index ({ request, response, view }) {
    const menu = (await Menu.query().with('user_menu').where({status: 'Y'}).fetch()).toJSON()
    const submenu = (await SubMenu.query().with('menu').with('user_menuDetail').where({status: 'Y'}).fetch()).toJSON()
    return view.render('setting.usr-menu.index', {
      menu: menu,
      submenu: submenu
    })
  }

  async create ({ auth, request, response, view }) {
    const usr = await auth.getUser()
    const user = (await User.query().whereNot({user_tipe: 'administrator'}).fetch()).toJSON()
    const menu = (await Menu.query().where({status: 'Y'}).fetch()).toJSON()
    const submenu = (await SubMenu.query().with('menu').with('user_menuDetail').where({status: 'Y'}).orderBy('menu_id').fetch()).toJSON()
    
    return view.render('setting.usr-menu.create', {user, menu, submenu})
  }

  async store ({ auth, request, response }) {
    const usr = await auth.getUser()
    const req = request.only(['user_id'])
    const arrReqMenu = request.collect(['menu'])
    const arrReqSubMenu = request.collect(['submenu'])
    // console.log('====================================');
    // console.log(arrReqMenu);
    // console.log(arrReqSubMenu);
    // console.log('====================================');

    const dataMenu = arrReqMenu.map(el => {
      return{
        menu_id: el.menu,
        user_id: req.user_id
      }
    })

    const dataSubMenu = arrReqSubMenu.map(el => {
      return{
        submenu_id: el.submenu,
        user_id: req.user_id
      }
    })

    try {
      await Db.table('usr_menus').where('user_id', req.user_id).delete()
      await Db.from('usr_menus').insert(dataMenu)


      await Db.table('usr_menu_details').where('user_id', req.user_id).delete()
      await Db.from('usr_menu_details').insert(dataSubMenu)

      new Loggerx(request.url(), request.all(), usr, request.method(), true).tempData()
    } catch (error) {
      console.log(error)
      new Loggerx(request.url(), request.all(), usr, request.method(), error).tempData()
      return {
        success: false,
        message: 'Failed grant menu to user...'
      }
    }

  }

  async show ({ params, request, response, view }) {
  }

  async edit ({ params, request, response, view }) {
  }

  async update ({ params, request, response }) {
  }

  async destroy ({ params, request, response }) {
  }
}

module.exports = SysMenuController
