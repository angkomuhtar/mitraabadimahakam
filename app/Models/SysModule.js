'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SysModule extends Model {
    sysgroup_user_mod () {
        return this.belongsToMany("App/Models/UsersGroup", "mod_id", "group_id").pivotTable('sys_users_groups')
    }
}

module.exports = SysModule
