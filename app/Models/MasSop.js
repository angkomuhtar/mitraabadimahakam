'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasSop extends Model {
    static get table(){
        return 'sop_registration_statuses'
    }
}

module.exports = MasSop