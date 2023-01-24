'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasSubContractor extends Model {
    equipment () {
        return this.hasMany("App/Models/MasEquipmentSubcont", "id", "subcont_id")
    }

    employee () {
        return this.hasMany("App/Models/MasEmployeeSubcont", "id", "subcont_id")
    }
}

module.exports = MasSubContractor
