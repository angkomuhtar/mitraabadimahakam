'use strict'

const moment = require("moment")
const _ = require('underscore')
const DailyFleet = use("App/Models/DailyFleet")
const MonthlyPlan = use("App/Models/MonthlyPlan")
const MasPit = use("App/Models/MasPit")
const MasShift = use("App/Models/MasShift")
const MasMaterial = use("App/Models/MasMaterial")

class OBReport {
    async SHOW (req) {
        let result = []
        let data
        try {
            data = (await DailyFleet.query()
            .with('ritase')
            .where( w => {
                w.where('activity_id', '11')
                if(req.pit_id){
                    w.where('pit_id', req.pit_id)
                }
                if(req.shift_id){
                    w.where('shift_id', req.shift_id)
                }
                if(!req.start_date || !req.end_date){
                    w.where('date', '>=', moment().startOf('month').format('YYYY-MM-DD'))
                    w.where('date', '<=', moment().endOf('month').format('YYYY-MM-DD'))
                }else{
                    w.where('date', '>=', req.start_date)
                    w.where('date', '<=', req.end_date)
    
                }
            }).fetch()).toJSON()
        } catch (error) {
            console.log(error);
        }


        const monthlyPlan = (
            await MonthlyPlan.query().where( w => {
                if(req.pit_id){
                    w.where('pit_id', req.pit_id)
                }
                w.where('month', moment(req.start_date).startOf('month').format('YYYY-MM-DD') 
                || moment().startOf('month').format('YYYY-MM-DD'))
                w.where('tipe', 'OB')
            }).fetch()
        ).toJSON() || []
        let total = monthlyPlan.reduce((a, b) => { return a + b.estimate }, 0)
        let jumHari = moment(req.start_date).daysInMonth() || moment().daysInMonth()

        for (const obj of data) {
            let masPit = await MasPit.query().where('id', obj.pit_id).last()
            let avgDistance = (obj.ritase).reduce((a, b) => { return a + b.distance }, 0) / (obj.ritase).length || 0

            let totActual = []
            let totRit = []
            for (const elm of obj.ritase) {
                const masMaterial = await MasMaterial.query().where('id', elm.material).last()
                totActual.push(parseFloat(masMaterial.vol) * parseFloat(elm.tot_ritase))
                totRit.push(parseFloat(elm.tot_ritase))
            }
            result.push({
                idFleet: obj.id,
                idpit: obj.pit_id,
                nmpit: masPit.name,
                idshift: obj.shift_id,
                target: total / parseInt(jumHari),
                date: moment(obj.date).format('YYYY-MM-DD'),
                avgJarak: avgDistance,
                totRit: totRit.reduce((a, b) => { return a + b }, 0),
                avgVolume: totActual.reduce((a, b) => { return a + b }, 0)
            })
        }

        result = _.groupBy(result, 'date')
        result = Object.keys(result).map(key => {
            let avg_distance = result[key].reduce((a, b) => { return a + b.avgJarak }, 0) / result[key].length
            return {
                date: key,
                avg_distance: avg_distance.toFixed(0),
                avg_target: result[key].reduce((a, b) => { return a + b.target }, 0) / result[key].length,
                sum_rit: result[key].reduce((a, b) => { return a + b.totRit }, 0),
                sum_volume: result[key].reduce((a, b) => { return a + b.avgVolume }, 0),
                item: result[key]
            }
        })

        return result
    }
}
module.exports = new OBReport()