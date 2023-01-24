'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamEquipmentPerformance extends Model {
    static get table() {
        return 'mam_equipment_performance'
    }

    equipment(){
        return this.belongsTo("App/Models/MasEquipment", "equip_id", "id")
    }
}

module.exports = MamEquipmentPerformance
