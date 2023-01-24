'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class MonthlyPlan extends Model {
    static boot () {
        super.boot()
        this.addHook('afterCreate', 'MonthlyPlanHook.afterCreate')
    }

    pit () {
        return this.belongsTo("App/Models/MasPit", "pit_id", "id")
    }

    daily_plan () {
        return this.hasMany("App/Models/DailyPlan", "id", "monthlyplans_id")
    }
}

module.exports = MonthlyPlan
