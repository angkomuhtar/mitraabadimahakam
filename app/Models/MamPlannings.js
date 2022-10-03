'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamPlannings extends Model {
    static get table() {
        return 'mam_plannings'
    }
}

module.exports = MamPlannings
