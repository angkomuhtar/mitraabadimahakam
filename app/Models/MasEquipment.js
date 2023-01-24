'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasEquipment extends Model {
    site () {
        return this.belongsTo("App/Models/MasSite", "site_id", "id")
    }

    dealer () {
        return this.belongsTo("App/Models/MasDealer", "dealer_id", "id")
    }

    daily_smu(){
        return this.hasMany("App/Models/DailySmuRecord", "id", "equip_id")
    }
}

module.exports = MasEquipment
