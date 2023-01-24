'use strict'

const moment = require("moment")
const _ = require('underscore')
const MasMaterial = use('App/Models/MasMaterial')
const DailyFleet = use('App/Models/DailyFleet')
const DailyRitase = use('App/Models/DailyRitase')
const DailyRitaseDetail = use('App/Models/DailyRitaseDetail')
const MonthlyPlans = use('App/Models/MonthlyPlan')
const DailyPlans = use('App/Models/DailyPlan')

class AjaxTruckCountObController {
    async index ( { request } ) {
        const req = request.all()
        let result = []

        /** DATA RITASE **/
        const ritData = (await DailyRitase.query()
        .with('daily_fleet', w => w.with('pit'))
        .where( w => {
            w.where('date', '>=', req.start_date || moment().startOf('month').format('YYYY-MM-DD'))
            w.where('date', '<=', req.end_date || moment().endOf('month').format('YYYY-MM-DD'))
        }).fetch()).toJSON() || []

        for (let obj of ritData) {
            const material = await MasMaterial.query().where('id', obj.material).last()
            const details = (await DailyRitaseDetail.query().where('dailyritase_id', obj.id).fetch()).toJSON() || []
            
            /** GROUPING BY PIT **/
            
            /** GROUPING BY HAULER **/
            let haulerGrp = _.groupBy(details, 'hauler_id')
            haulerGrp = Object.keys(haulerGrp).map( key => {
                return {
                    idhauler: key,
                    rit: haulerGrp[key].length,
                    vol: haulerGrp[key].length * parseInt(obj.tot_ritase)
                }
            })
            // console.log(haulerGrp);

            result.push({
                pit_name: obj.daily_fleet.pit.name,
                material: obj.material,
                distance: obj.distance,
                tot_rit: obj.tot_ritase,
                tot_volum: parseInt(material.vol) * parseInt(obj.tot_ritase),
                // item: haulerGrp
            })
        }
        return result
    }
}

module.exports = AjaxTruckCountObController
