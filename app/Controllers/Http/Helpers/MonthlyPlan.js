'use strict'

const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")
const DailyRitase = use("App/Models/DailyRitase")
const MonthlyPlans = use("App/Models/MonthlyPlan")
const DailyFleet = use("App/Models/DailyFleet")
const DailyPlans = use("App/Models/DailyPlan")
const moment = require('moment')
const db = use('Database')

class MonthlyPlan {
    async ALL_MONTHLY (req) {
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)

        const data = await MonthlyPlans.query().with('pit').orderBy('created_at', 'desc').paginate(halaman, limit)
        return data
    }

    async CHARTIST_MONTHLY (req) {
        let currentMonthDates = Array.from({length: moment().daysInMonth()}, 
        (x, i) => moment().startOf('month').add(i, 'days').format('DD'))
        let awalBulan = moment().startOf('month').format('YYYY-MM-DD')
        try {
            let dailyPlans
            if(req.periode){
                dailyPlans = (
                        await DailyPlans
                        .query()
                        .with('monthly_plan')
                        .where('current_date', 'like', `${req.periode}%`)
                        .fetch()
                    ).toJSON()
            }else{
                dailyPlans = (
                    await DailyPlans
                    .query()
                    .with('monthly_plan')
                    .where('current_date', '<=', awalBulan)
                    .andWhere('current_date', '>=', `${moment().format('YYYY-MM')}`)
                    .fetch()
                ).toJSON()
            }
            const data = {
                monthly_plan: dailyPlans[0].monthly_plan,
                labels: currentMonthDates,
                actual: dailyPlans.map(item => parseFloat(item.actual))
            }
            data.monthly_plan.month = moment().format('MMMM YYYY')
            return data
        } catch (error) {
            console.log(error);
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

    async CHARTIST_RITASE_OB_EQUIPMENT() {
        const date = moment().format('YYYY-MM-DD')
        try {
            const data = (await DailyRitase
                .query()
                .with('daily_fleet', a => a.with('fleet'))
                .with('ritase_details')
                .where('date', 'like', `${date}`)
                .fetch()).toJSON()
            return data.map(item => {
                return {
                    fleet: item.daily_fleet.fleet.kode,
                    name: item.daily_fleet.fleet.name,
                    tot_ritase: item.tot_ritase
                }
            })
        } catch (error) {
            return {
                fleet: ['F01', 'F02', 'F03', 'F04'],
                tot_ritase: [0,0,0,0]
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
        try {
            const monthlyPlans = new MonthlyPlans()
            monthlyPlans.fill({pit_id, tipe, month, estimate, actual, satuan})
            await monthlyPlans.save()
            const data = await MonthlyPlans.query().with('daily_plan').last()
            return data
        } catch (error) {
            console.log(error);
        }

    }
}

module.exports = new MonthlyPlan()