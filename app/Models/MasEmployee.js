'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasEmployee extends Model {
    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'EmployeeHook.addDatas')
        // this.addHook('beforeUpdate', 'EmployeeHook.editDatas')
    }
}

module.exports = MasEmployee
