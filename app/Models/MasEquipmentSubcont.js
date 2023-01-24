'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasEquipmentSubcont extends Model {
    subcon () {
        return this.belongsTo("App/Models/MasSubContractor", "subcont_id", "id")
    }
}

module.exports = MasEquipmentSubcont
