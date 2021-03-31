'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SysOption extends Model {
    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'OptionHook.addOptions')
        this.addHook('beforeUpdate', 'OptionHook.editOptions')
    }
}

module.exports = SysOption
