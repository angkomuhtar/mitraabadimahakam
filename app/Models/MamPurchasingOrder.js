'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamPurchasingOrder extends Model {
    static get table(){
        return 'mam_purchasing_order'
    }

    items () {
        return this.hasMany("App/Models/MamPurchasingOrderItem", "id", "order_id")
    }
}

module.exports = MamPurchasingOrder
