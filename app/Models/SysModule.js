'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SysModule extends Model {
    tipe_akses () {
        return this.belongsToMany("App/Models/User", "mod_id", "user_tipe").pivotTable('sys_users_groups')
    }
}

module.exports = SysModule
