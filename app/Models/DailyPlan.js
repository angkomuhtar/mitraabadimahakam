'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class DailyPlan extends Model {
    static boot () {
        super.boot()
        this.addHook('afterUpdate', 'DailyPlanHook.afterUpdate')
    }

    monthly_plan () {
        return this.belongsTo("App/Models/MonthlyPlan", "monthlyplans_id", "id")
    }
}

module.exports = DailyPlan
