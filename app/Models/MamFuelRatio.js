'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamFuelRatio extends Model {
    static get table(){
        return 'mam_fuel_ratios'
    }

    site () {
        return this.belongsTo("App/Models/MasSite", "site_id", "id")
    }

    pit () {
        return this.belongsTo("App/Models/MasPit", "pit_id", "id")
    }

    user () {
        return this.belongsTo("App/Models/VUser", "user_id", "id")
    }
}

module.exports = MamFuelRatio
