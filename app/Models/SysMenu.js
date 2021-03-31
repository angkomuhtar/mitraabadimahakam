'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SysMenu extends Model {
    submenu () {
        return this.hasMany("App/Models/SysMenu", "id", "menu_id")
    }

    user_menu () {
        return this.belongsToMany("App/Models/User").pivotTable('usr_menus')
    }
}

module.exports = SysMenu
