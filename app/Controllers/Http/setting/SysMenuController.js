'use strict'

const User = use("App/Models/User")
const Menu = use("App/Models/SysMenu")
const SubMenu = use("App/Models/SysMenuDetail")

class SysMenuController {
  /**
   * Show a list of all sysmenus.
   * GET sysmenus
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
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
    const arrReqMenu = request.only(['menu'])
    const arrReqSubMenu = request.only(['submenu'])
    
    console.log(req);
    console.log(arrReqMenu);
    console.log(arrReqSubMenu);
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
