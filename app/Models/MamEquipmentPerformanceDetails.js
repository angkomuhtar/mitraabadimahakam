'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamEquipmentPerformanceDetails extends Model {
    static get table() {
        return 'mam_equipment_performance_details'
    }

    equipment(){
        return this.belongsTo("App/Models/MasEquipment", "equip_id", "id")
    }
}

module.exports = MamEquipmentPerformanceDetails
