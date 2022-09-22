'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyRitaseCoal extends Model {
    static boot () {
        super.boot()
        this.addHook('beforeCreate', 'DailyRitaseCoalHook.beforeInsertData')
    }

    pit(){
        return this.belongsTo("App/Models/MasPit", "pit_id", "id")
    }

    daily_fleet(){
        return this.belongsTo("App/Models/DailyFleet", "dailyfleet_id", "id")
    }

    checker () {
        return this.belongsTo("App/Models/VUser", "checker_id", "id")
    }

    shift () {
        return this.belongsTo("App/Models/MasShift", "shift_id", "id")
    }

    ritase_details(){
        return this.hasMany("App/Models/DailyRitaseCoalDetail", "id", "ritasecoal_id")
    }
}

module.exports = DailyRitaseCoal
