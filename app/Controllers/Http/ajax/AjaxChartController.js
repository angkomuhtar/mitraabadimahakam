'use strict'

const MonthlyPlanHelpers = use("App/Controllers/Http/Helpers/MonthlyPlan")
const DailyRefueling = use("App/Models/DailyRefueling")
const moment = require('moment')
const _ = require('underscore')

class AjaxChartController {
    async grafik_OB_MTD ({ request }) {
        const req = request.all()
        const grafik1 = await MonthlyPlanHelpers.CHARTIST_MONTHLY_OB(req)
        return grafik1
    }

    async grafik_COAL_MTD ({ request }) {
        const req = request.all()
        const grafik1 = await MonthlyPlanHelpers.CHARTIST_MONTHLY_COAL(req)
        return grafik1
    }

    async grafik_OB_RITASE_EQUIPMENT () {
        const grafik2 = await MonthlyPlanHelpers.CHARTIST_RITASE_OB_EQUIPMENT()
        const labels = grafik2.map(item => item.fleet)
        const data = grafik2.map(item => parseInt(item.tot_ritase))
        return {
            date: moment().format('Do, MMMM YYYY'),
            labels, 
            data
        }
    }

    async grafik_FUEL_MTD ({ request }) {
        const req = request.all()
        const arrDate = Array.from({length: moment(req.periode).daysInMonth()}, 
            (x, i) => moment(req.periode).startOf('month').add(i, 'days').format('YYYY-MM-DD'))

        /* Get Semua data equipment pada periode */
        let dataPeriode = []
        const isCurrentMonth = req.periode === moment().format('YYYY-MM')
        if(isCurrentMonth){
            const awalData = moment(req.periode).startOf('month').format('YYYY-MM-DD')
            dataPeriode = (
                await DailyRefueling
                    .query()
                    .where('fueling_at', '>=', awalData)
                    .andWhere('fueling_at', '<=', new Date())
                    .select('id', 'topup', 'fueling_at')
                    .fetch()
            ).toJSON()
        }else{
            const beginDate = moment(_.first(arrDate)).startOf('day').format('YYYY-MM-DD HH:mm:ss')
            const lastDate = moment(_.last(arrDate)).endOf('day').format('YYYY-MM-DD HH:mm:ss')
            dataPeriode = (
                await DailyRefueling
                    .query()
                    .where('fueling_at', '>=', beginDate)
                    .andWhere('fueling_at', '<=', lastDate)
                    .fetch()
            ).toJSON()
        }
        

        dataPeriode = dataPeriode.map(item => { return {...item, fueling_at: moment(item.fueling_at).format('DD')} })

        var result = [];
        dataPeriode.reduce(function(res, value) {
            if (!res[value.fueling_at]) {
              res[value.fueling_at] = { fueling_at: value.fueling_at, topup: 0 };
              result.push(res[value.fueling_at])
            }
            res[value.fueling_at].topup += value.topup;
            return res;
          }, {});
        
        return {
            x: _.pluck(result, 'fueling_at'),
            y: _.pluck(result, 'topup')
        }

    }
}

module.exports = AjaxChartController
