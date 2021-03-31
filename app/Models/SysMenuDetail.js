'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SysMenuDetail extends Model {
    menu () {
        return this.belongsTo("App/Models/SysMenu", "menu_id", "id")
    }

    user_menuDetail () {
        return this.belongsToMany("App/Models/User", "submenu_id", "user_id").pivotTable('usr_menu_details')
    }
}

module.exports = SysMenuDetail
