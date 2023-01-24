'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamPurchasingOrder extends Model {
    static get table(){
        return 'mam_purchasing_order_items'
    }

    barang () {
        return this.belongsTo("App/Models/MasBarang", "barang_id", "id")
    }

    barang_alt () {
        return this.belongsTo("App/Models/MasBarang", "replace_with", "id")
    }

    equipment () {
        return this.belongsTo("App/Models/MasEquipment", "equipment_id", "id")
    }
}

module.exports = MamPurchasingOrder
