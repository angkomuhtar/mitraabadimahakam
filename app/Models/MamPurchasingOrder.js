'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamPurchasingOrder extends Model {
    static get table(){
        return 'mam_purchasing_order'
    }

    author () {
        return this.belongsTo("App/Models/VUser", "created_by", "id")
    }

    pr () {
        return this.belongsTo("App/Models/MamPurchasingRequest", "request_id", "id")
    }

    vendor () {
        return this.belongsTo("App/Models/MasSupplier", "vendor_id", "id")
    }

    gudang () {
        return this.belongsTo("App/Models/MasGudang", "gudang_id", "id")
    }

    items () {
        return this.hasMany("App/Models/MamPurchasingOrderItem", "id", "order_id")
    }
}

module.exports = MamPurchasingOrder
