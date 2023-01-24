'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class LogMaterialRequestItem extends Model {
    static get table(){
        return 'mam_material_request_items'
    }

    materialRequest () {
        return this.belongsTo("App/Models/LogMaterialRequest", "material_req_id", "id")
    }

    barang () {
        return this.belongsTo("App/Models/MasBarang", "barang_id", "id")
    }

    equipment () {
        return this.belongsTo("App/Models/MasEquipment", "equipment_reff", "id")
    }

    received () {
        return this.belongsTo("App/Models/Users", "received_by", "id")
    }
}

module.exports = LogMaterialRequestItem
