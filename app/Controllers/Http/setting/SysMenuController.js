'use strict'


const Logger = use('Logger')
var moment = require('moment')
const jam = moment().format('hh:mm:ss')

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
    Logger.transport('file').info('-----------------------------------------------------------------------')
    const usr = await auth.getUser()
    const req = request.only(['user_id'])
    const arrReqMenu = request.only(['menu'])
    const arrReqSubMenu = request.only(['submenu'])

    const trx = await Db.beginTransaction()
    try {
      const user = await User.findOrFail(req.user_id)
      let menux = arrReqMenu.menu.map(async el => {
        try {
          await user.user_menu().sync([el])
          Logger.transport('file').info({post: true, jam: jam, user: usr, req: {user_id: req.user_id, menu_id: el}})
        } catch (error) {
          console.log(error);
          Logger.transport('file').info({post: false, jam: jam, user: usr, error: error})
          await trx.rollback()
        }
      })
      console.log(menux);
  
      let submenux = arrReqSubMenu.submenu.map(async el => {
        try {
          await user.user_menuDetail().sync([el])
          Logger.transport('file').info({post: true, jam: jam, user: usr, req: {user_id: req.user_id, submenu_id: el}})
        } catch (error) {
          console.log(error);
          Logger.transport('file').info({post: false, jam: jam, user: usr, error: error})
          await trx.rollback()
        }
      })
      console.log(submenux);
      
      await trx.commit()
    } catch (error) {
      await trx.rollback()
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
