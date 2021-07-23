'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MamFuelDist extends Model {
    site () {
        return this.belongsTo("App/Models/MasSite", "site_id", "id")
    }

    agen () {
        return this.belongsTo("App/Models/MasFuelAgen", "agen_id", "id")
    }

    fuel () {
        return this.belongsTo("App/Models/MasFuel", "fuel_id", "id")
    }
}

module.exports = MamFuelDist
