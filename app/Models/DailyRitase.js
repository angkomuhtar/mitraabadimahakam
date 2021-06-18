'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyRitase extends Model {
    daily_fleet(){
        return this.belongsTo("App/Models/DailyFleet", "dailyfleet_id", "id")
    }
}

module.exports = DailyRitase
