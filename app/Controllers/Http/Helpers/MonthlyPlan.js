'use strict'

const db = use('Database')
const moment = require('moment')
const MonthlyPlans = use("App/Models/MonthlyPlan")
const DailyPlans = use("App/Models/DailyPlan")

class MonthlyPlan {
    async ALL_MONTHLY (req) {
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)

        const data = await MonthlyPlans.query().with('pit').paginate(halaman, limit)
        return data
    }

    async CHARTIST_MONTHLY () {
        try {
            const dailyPlans = (await DailyPlans.query().with('monthly_plan').where('current_date', 'like', `${moment().format('YYYY-MM')}%`).fetch()).toJSON()
            const data = {
                monthly_plan: dailyPlans[0].monthly_plan,
                labels: dailyPlans.map(item => moment(item.current_date).format('DD MMM')),
                actual: dailyPlans.map(item => parseFloat(item.actual))
            }
            data.monthly_plan.month = moment(data.monthly_plan.month).format('MMMM YYYY')
            return data
        } catch (error) {
            const currentMonthDates = Array.from({length: moment().daysInMonth()}, 
            (x, i) => moment().startOf('month').add(i, 'days').format('YYYY-MM-DD'))

            return {
                monthly_plan: {
                    month: moment().format('MMMM YYYY'),
                    satuan: 'BCM',
                    estimate: 0,
                    actual: 0
                },
                labels: currentMonthDates,
                actual: []
            }
        }
    }

    async ALL_DAILY (req) {
        const limit = 31
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const data = await DailyPlans.query().with('monthly_plan').where('monthlyplans_id', req.monthlyplans_id).paginate(halaman, limit)

        return data
    }

    async POST (req) { 
        const { pit_id, tipe, month, estimate, actual } = req
        const satuan = tipe != 'BB' ? 'BCM':'MT'

        const currentMonthDates = Array.from({length: moment().daysInMonth()}, 
        (x, i) => moment().startOf('month').add(i, 'days').format('YYYY-MM-DD'))

        let array = []
        for (const item of currentMonthDates) {
            array.push({
                current_date: item,
                estimate: estimate / currentMonthDates.length,
                monthlyplans_id: 1
            })
        }

        console.log(array);
        const trx = await db.beginTransaction()
        try {
            const monthlyPlans = new MonthlyPlans()
            monthlyPlans.fill({pit_id, tipe, month, estimate, actual, satuan})
            await monthlyPlans.save(trx)
            for (const item of array) {
                const dailyPlans = new DailyPlans()
                dailyPlans.fill(item)
                await dailyPlans.save(trx)
            }
            await trx.commit()
        } catch (error) {
            console.log(error);
            await trx.rollback()
        }

    }
}

module.exports = new MonthlyPlan()