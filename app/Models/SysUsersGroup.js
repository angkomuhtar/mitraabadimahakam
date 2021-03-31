'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SysUsersGroup extends Model {
    sysusergrp_module () {
        return this.belongsToMany("App/Models/SysModule", "grp_id", "mod_id").pivotTable('user_modules')
    }
}

module.exports = SysUsersGroup
