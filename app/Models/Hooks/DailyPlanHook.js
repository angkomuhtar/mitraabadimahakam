'use strict'

const DailyPlan = use("App/Models/DailyPlan")
const MonthlyPlan = use("App/Models/MonthlyPlan")

const DailyPlanHook = exports = module.exports = {}

DailyPlanHook.afterSave = async (dailyplan) => {
    const sumActual = await DailyPlan.query().where('monthlyplans_id', dailyplan.monthlyplans_id).getSum('actual')
    const monthlyPlan = await MonthlyPlan.findOrFail(dailyplan.monthlyplans_id)
    monthlyPlan.merge({actual: sumActual})
    await monthlyPlan.save()
}