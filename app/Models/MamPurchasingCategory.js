'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamPurchasingCategory extends Model {
    static get table(){
        return 'mam_purchasing_categories'
    }

    receiver () {
        return this.belongsTo("App/Models/VUser", "receiver_id", "id")
    }
}

module.exports = MamPurchasingCategory
