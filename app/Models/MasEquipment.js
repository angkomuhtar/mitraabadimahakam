'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MasEquipment extends Model {
    dealer () {
        return this.belongsTo("App/Models/MasDealer", "dealer_id", "id")
    }
}

module.exports = MasEquipment
