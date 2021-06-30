'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MonthlyPlan extends Model {
    pit () {
        return this.belongsTo("App/Models/MasPit", "pit_id", "id")
    }

    daily_plan () {
        return this.hasMany("App/Models/DailyPlan", "id", "monthlyplans_id")
    }
}

module.exports = MonthlyPlan
