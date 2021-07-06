'use strict'

const db = use('Database')
const moment = require('moment')
const DailyPlan = use("App/Models/DailyPlan")
const MonthlyPlan = use("App/Models/MonthlyPlan")

const MonthlyPlanHook = exports = module.exports = {}

MonthlyPlanHook.afterCreate = async (monthlyplan) => {
    const currentMonthDates = Array.from({length: moment(monthlyplan.month).daysInMonth()},
    (x, i) => moment().startOf('month').add(i, 'days').format('YYYY-MM-DD'))
    try {
        const arr = []
        for (const item of currentMonthDates) {
            arr.push({
                current_date: item,
                estimate: monthlyplan.estimate / currentMonthDates.length,
                tipe: monthlyplan.tipe === 'OB' ? 'OB':'COAL',
                monthlyplans_id: monthlyplan.id
            })
        }
        await DailyPlan.createMany(arr)
    } catch (error) {
        console.log(error);
    }
}