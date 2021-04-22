'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class VPrivilege extends Model {
    static get table(){
        return 'v_privileges'
    }
}


module.exports = VPrivilege
