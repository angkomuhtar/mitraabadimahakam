'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UsersGroup extends Model {
    sysgroup_user () {
        return this.belongsToMany("App/Models/User", "group_id", "user_id").pivotTable('sys_users_groups')
    }
}

module.exports = UsersGroup
