'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasDealer extends Model {
    equipment () {
        return this.hasMany("App/Models/MasEquipment", "id", "dealer_id")
    }
}

module.exports = MasDealer
