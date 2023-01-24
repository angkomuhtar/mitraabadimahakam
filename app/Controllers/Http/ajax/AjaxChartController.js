'use strict'

const MonthlyPlanHelpers = use("App/Controllers/Http/Helpers/MonthlyPlan")
const DailyRitaseCoalDetail = use("App/Models/DailyRitaseCoalDetail")
const DailyChecklist = use("App/Models/DailyChecklist")
const DailyRefueling = use("App/Models/DailyRefueling")
const DailyRitase = use("App/Models/DailyRitase")
const DailyEvent = use("App/Models/DailyEvent")
const MasEvent = use("App/Models/MasEvent")
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
        // const grafik1 = await MonthlyPlanHelpers.CHARTIST_MONTHLY_COAL(req)
        const grafik1 = await MonthlyPlanHelpers.CHART_MOTHLY_COAL(req)
        // console.log('grafik1 ::', grafik1);
        return grafik1
    }

    async grafik_OB_RITASE_EQUIPMENT ({ request }) {
        const req = request.all()
        const grafik2 = await MonthlyPlanHelpers.CHARTIST_RITASE_OB_EQUIPMENT(req)
        const labels = grafik2.map(item => `${item.exca}`)

        const data = grafik2.map(item => parseInt(item.tot_ritase));

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

            
        const start = moment(req.periode).startOf('month').format('YYYY-MM-DD')
        const finish = moment(req.periode).endOf('month').format('YYYY-MM-DD')

        const data = (
            await DailyRefueling
            .query()
            .where( w => {
                w.where('fueling_at', '>=', start)
                w.where('fueling_at', '<=', finish)
            })
            .fetch()
        ).toJSON()
        

        let grouping = _.groupBy(
            data.map(
                el => { 
                    return {
                        ...el, 
                        fueling_at: moment(el.fueling_at).format('YYYY-MM-DD')
                    }
                }), grp => grp.fueling_at)

        // console.log(grouping);
        grouping = Object.keys(grouping).map(
            el => {
                return {
                    tgl: el, topup: grouping[el].reduce((a, b) => { return a + b.topup }, 0)
                }
            })
        
            
            for (const item of arrDate) {
                // console.log(!grouping.map(obj => obj.tgl).includes(item), item);
                if(!grouping.map(obj => obj.tgl).includes(item)){
                    grouping.push({tgl: item, topup: 0})
                }
            }

            
        let resultData = _.sortBy(grouping, 'tgl')
          
        return {
            x: resultData.map(el => (el.tgl).substr(8, 2)),
            y: resultData.map(el => (el.topup))
        }

    }

    async grafik_EVENT_MTD ({ request }) {
        const req = request.all()
        let data = []
        const rangeAwal = moment(req.periode).startOf('month').format('YYYY-MM-DD HH:mm:ss')
        const rangeAkhir = moment(req.periode).endOf('month').format('YYYY-MM-DD HH:mm:ss')
        

        const masEvent = (await MasEvent.query().where('engine', 'off').andWhere('aktif', 'Y').fetch()).toJSON()
        for (const event of masEvent) {
            const dailyEvent = await DailyEvent.query().where(range => range.where('start_at', '>=', rangeAwal).andWhere('end_at', '<=', rangeAkhir)).andWhere('event_id', event.id).getAvgDistinct('time_duration')
            if(dailyEvent){
                // console.log(dailyEvent/60);
                data.push({labels: event.narasi, nilai: (dailyEvent/60).toFixed(0)})
            }
        }
        var maxTick = _.max(data, function(max){ return Math.ceil(max.nilai) })
        return {data: data, len: maxTick.nilai}
        
    }

    async grafik_COST_VS_PROD({ request }){
        const req = request.all()
        const arrTahunBulan = Array.apply(0, Array(12)).map(function(_, i){return req.periode +'-'+ moment().month(i).format('MM')})
        let sumFuel = []
        let sumCoal = []
        let sumHM = []
        let sumOB = []
        for (const item of arrTahunBulan) {
            const fuel = await DailyRefueling.query().where('fueling_at', 'like', `${item}%`).getSum('topup')
            if(fuel){
                sumFuel.push(fuel)
            }else{
                sumFuel.push(0)
            }

            const coal = await DailyRitaseCoalDetail.query().where('checkout_pit', 'like', `${item}%`).getSum('w_netto')
            if(coal){
                sumCoal.push(coal/1000)
            }else{
                sumCoal.push(0)
            }

            const ob = await DailyRitase.query().where('date', 'like', `${item}%`).getSum('tot_ritase')
            if(ob){
                sumOB.push((ob * 22))
            }else{
                sumOB.push(0)
            }

            const smu = await DailyChecklist.query().where('tgl', 'like', `${item}%`).getSum('used_smu')
            if(smu){
                sumHM.push(smu)
            }else{
                sumHM.push(0)
            }
        }
        return {
            fuel: sumFuel,
            coal: sumCoal,
            smu: sumHM,
            ob: sumOB
        }
    }
}

module.exports = AjaxChartController
