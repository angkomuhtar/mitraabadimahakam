'use strict'

const DailyPlan = use("App/Models/DailyPlan")
const MonthlyPlan = use("App/Models/MonthlyPlan")

const DailyPlanHook = exports = module.exports = {}

DailyPlanHook.afterUpdate = async (dailyplan) => {
    if(dailyplan.monthlyplans_id){
        const sumActual = await DailyPlan.query().where('monthlyplans_id', dailyplan.monthlyplans_id).getSum('actual')
        const monthlyPlan = await MonthlyPlan.findOrFail(dailyplan.monthlyplans_id)
        monthlyPlan.merge({actual: sumActual})
        await monthlyPlan.save()
    }
}


DailyPlanHook.beforeInsertData = async dailyplan => {
    const check = await MonthlyPlan.query()
         .with('pit', wh => wh.with('site'))
         .where('id', dailyplan.monthlyplans_id)
         .last()

    if (check) {
         const data = check;
         dailyplan.site_id = data.pit.site.id;
         dailyplan.pit_id = data.pit.id;
    }
}