'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasDepartment extends Model {
    static get table(){
        return 'mas_departments'
    }
}

module.exports = MasDepartment
