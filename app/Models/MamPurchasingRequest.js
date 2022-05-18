'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PurchasingRequest extends Model {
    static get table(){
        return 'mam_purchasing_request'
    }

    site () {
        return this.belongsTo("App/Models/MasSite", "site_id", "id")
    }

    author () {
        return this.belongsTo("App/Models/VUser", "createdby", "id")
    }

    mengetahui () {
        return this.belongsTo("App/Models/VUser", "acceptby", "id")
    }

    items () {
        return this.hasMany("App/Models/MamPurchasingRequestItem", "id", "request_id")
    }
}

module.exports = PurchasingRequest
