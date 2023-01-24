'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyFleet extends Model {
    pit () {
        return this.belongsTo("App/Models/MasPit", "pit_id", "id")
    }

    fleet () {
        return this.belongsTo("App/Models/MasFleet", "fleet_id", "id")
    }

    activities () {
        return this.belongsTo("App/Models/MasActivity", "activity_id", "id")
    }

    shift () {
        return this.belongsTo("App/Models/MasShift", "shift_id", "id")
    }

    user () {
        return this.belongsTo("App/Models/User")
    }

    details () {
        return this.hasMany("App/Models/DailyFleetEquip", "id", "dailyfleet_id")
    }

    ritase () {
        return this.hasMany("App/Models/DailyRitase", "id", "dailyfleet_id")
    }
}

module.exports = DailyFleet
