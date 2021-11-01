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

        const data = (
            await MonthlyPlans
            .query()
            .with('pit')
            .orderBy('created_at', 'desc')
            .paginate(halaman, limit)
        ).toJSON()

        let result = []

        for (const item of data.data) {
            result.push({
                ...item,
                actual: item.tipe === 'BB' ? 
                (
                    item.actual != 0 ? parseFloat(item.actual) / 1000 : 0
                ) 
                : 
                item.actual
            })
        }

        return {...data, data: result}
    }

    async CHARTIST_MONTHLY_OB (req) {
        const currentMonthDates = Array.from({length: moment().daysInMonth()}, 
        (x, i) => moment().startOf('month').add(i, 'days').format('DD'))

        const isCurrentMonth = req.periode === moment().format('YYYY-MM')
        try {
            let dailyPlans
            if(isCurrentMonth){
                const awalBulan = moment(req.periode).startOf('month').format('YYYY-MM-DD')
                dailyPlans = (
                        await DailyPlans
                        .query()
                        .with('monthly_plan')
                        .where('current_date', '>=', awalBulan)
                        .andWhere('current_date', '<=', new Date())
                        .andWhere('tipe', 'OB')
                        .fetch()
                    ).toJSON()
                    // console.log(awalBulan);
            }else{
                const arrDate = Array.from({length: moment(req.periode).daysInMonth()}, 
                (x, i) => moment(req.periode).startOf('month').add(i, 'days').format('YYYY-MM-DD'))

                dailyPlans = (
                    await DailyPlans
                    .query()
                    .with('monthly_plan')
                    .whereIn('current_date', arrDate)
                    .andWhere('tipe', 'OB')
                    .fetch()
                ).toJSON()
                
            }


            const data = {
                monthly_plan: dailyPlans[0] ? dailyPlans[0].monthly_plan : null,
                labels: currentMonthDates,
                actual: dailyPlans.map(item => parseFloat(item.actual))
            }
            data.monthly_plan.month = moment().format('MMMM YYYY')
            // console.log('DATA    :::::', data);
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

    async CHARTIST_MONTHLY_COAL (req) {
        const currentMonthDates = Array.from({length: moment().daysInMonth()}, 
        (x, i) => moment().startOf('month').add(i, 'days').format('DD'))

        const isCurrentMonth = req.periode === moment().format('YYYY-MM')
        try {
            let dailyPlans
            if(isCurrentMonth){
                const awalBulan = moment(req.periode).startOf('month').format('YYYY-MM-DD')
                dailyPlans = (
                        await DailyPlans
                        .query()
                        .with('monthly_plan')
                        .where('current_date', '>=', awalBulan)
                        .andWhere('current_date', '<=', new Date())
                        .andWhere('tipe', 'COAL')
                        .fetch()
                    ).toJSON()
            }else{
                const arrDate = Array.from({length: moment(req.periode).daysInMonth()}, 
                (x, i) => moment(req.periode).startOf('month').add(i, 'days').format('YYYY-MM-DD'))

                dailyPlans = (
                    await DailyPlans
                    .query()
                    .with('monthly_plan')
                    .whereIn('current_date', arrDate)
                    .andWhere('tipe', 'COAL')
                    .fetch()
                ).toJSON()
            }
            const data = {
                monthly_plan: dailyPlans[0].monthly_plan,
                labels: currentMonthDates,
                actual: dailyPlans.map(item => (parseFloat(item.actual)/1000))
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

    async CHARTIST_RITASE_OB_EQUIPMENT(req) {
        const date = req.periode ? moment(req.periode).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
        try {
            const data = (await DailyRitase
                .query()
                .with('unit')
                .with('daily_fleet', a => a.with('fleet'))
                .with('ritase_details')
                .where('date', 'like', `${date}`)
                .fetch()).toJSON()
            // console.log('DATA>>>> ', data);
            return data.map(item => {
                return {
                    fleet: item.daily_fleet.fleet.kode,
                    name: item.daily_fleet.fleet.name,
                    exca: item.unit ? item.unit.kode : 'UNSET',
                    tot_ritase: item.tot_ritase
                }
            })
        } catch (error) {
            return {
                fleet: ['F01', 'F02', 'F03', 'F04', 'F05'],
                tot_ritase: [0,0,0,0]
            }
        }
    }

    async ALL_DAILY (req) {
        const limit = 31
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        // const data = await DailyPlans.query().with('monthly_plan').where('monthlyplans_id', req.monthlyplans_id).paginate(halaman, limit)
        let data = (await DailyPlans.query().with('monthly_plan').where('monthlyplans_id', req.monthlyplans_id).paginate(halaman, limit)).toJSON()
        let result = []
        for (const item of data.data) {
            result.push({
                ...item,
                actual: item.actual != 0 ? parseFloat(item.actual) / 1000 : 0
            })
        }
        return {...data, data: result}
    }

    async GET_ID (params) {
        const data = await MonthlyPlans.find(params.id)
        return data
    }

    async POST (req) { 
        const { pit_id, tipe, month, estimate, actual } = req
        const satuan = req.tipe === 'OB' ? 'BCM':'MT'
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

    async UPDATE (params, req) {
        let monthlyPlans = await MonthlyPlans.find(params.id)
        try {
            await monthlyPlans.delete()
            monthlyPlans = new MonthlyPlans()
            monthlyPlans.fill(req)
            await monthlyPlans.save()
            return monthlyPlans
        } catch (error) {
            throw new Error('Failed...')
        }
    }
}

module.exports = new MonthlyPlan()