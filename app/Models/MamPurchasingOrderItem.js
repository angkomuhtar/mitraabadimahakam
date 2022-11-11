'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamPurchasingOrder extends Model {
    static get table(){
        return 'mam_purchasing_order_items'
    }
}

module.exports = MamPurchasingOrder
