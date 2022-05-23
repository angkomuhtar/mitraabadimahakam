'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamPurchaseRequestItem extends Model {
    static get table(){
        return 'mam_purchasing_request_items'
    }

    order () {
        return this.belongsTo("App/Models/MamPurchaseRequest", "order_id", "id")
    }

    barang () {
        return this.belongsTo("App/Models/MasBarang", "barang_id", "id")
    }

    equipment () {
        return this.belongsTo("App/Models/MasEquipment", "equipment_id", "id")
    }
}

module.exports = MamPurchaseRequestItem
