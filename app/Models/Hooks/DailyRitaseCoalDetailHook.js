'use strict'

const moment = require('moment')
const DailyPlan = use("App/Models/DailyPlan")
const DailyFleet = use("App/Models/DailyFleet")
const MonthlyPlan = use("App/Models/MonthlyPlan")
const DailyRitaseCoal = use("App/Models/DailyRitaseCoal")
const DailyRitaseCoalDetail = use("App/Models/DailyRitaseCoalDetail")

const DailyRitaseCoalDetailHook = exports = module.exports = {}

DailyRitaseCoalDetailHook.afterSave = async (coalDetailRit) => {
    
    await UPDATE_DATA_MASTER (coalDetailRit)
}

DailyRitaseCoalDetailHook.afterDelete = async (coalDetailRit) => {
    await UPDATE_DATA_MASTER (coalDetailRit)
}



async function UPDATE_DATA_MASTER (data) {
    const db = use("Database")
    const trx = await db.beginTransaction()
    const awalBulan = moment(data.checkin_jt).startOf('month').format('YYYY-MM-DD')

    /* GET PIT ID */ 
    const dailyRitaseCoal = (
        await DailyRitaseCoal
            .query(trx)
            .with('daily_fleet')
            .where('id', data.ritasecoal_id)
            .last()
    ).toJSON()

    
    // dailyfleet nya
    const {pit_id} = dailyRitaseCoal.daily_fleet

    const monthlyPlan = await MonthlyPlan.query(trx).where( w => {
        w.where('pit_id', pit_id)
        w.where('tipe', 'BB')
        w.where('month', awalBulan)
    }).last()
    

    try {
        if(data.checkout_jt){
            const dailyPlan = await DailyPlan.query(trx)
                .with('monthly_plan')
                .where( w => {
                    w.where('tipe', 'COAL')
                    w.where('monthlyplans_id', monthlyPlan.id)
                    w.where('current_date', moment(data.checkout_pit).format('YYYY-MM-DD'))
                })
                .first()

            const coal_rit = await DailyRitaseCoalDetail
                .query(trx)
                .where( w => {
                    w.where('w_netto', '>', 0)
                    w.where('ritasecoal_id', data.ritasecoal_id)
                })
                .getCount('ritasecoal_id')

            const tw_gross = await DailyRitaseCoalDetail.query(trx)
                .where(w => {
                    w.where('checkin_jt', '>=', awalBulan)
                    w.where('checkin_jt', '<=', data.checkin_jt)
                })
                .andWhere('ritasecoal_id', data.ritasecoal_id)
                .getSum('w_gross')

            const tw_tare = await DailyRitaseCoalDetail.query(trx)
                .where(w => w.where('checkin_jt', '>=', awalBulan).andWhere('checkin_jt', '<=', data.checkin_jt))
                .andWhere('ritasecoal_id', data.ritasecoal_id)
                .getSum('w_tare')

            const tw_netto = await DailyRitaseCoalDetail.query(trx)
                .where(w => w.where('checkin_jt', '>=', awalBulan).andWhere('checkin_jt', '<=', data.checkin_jt))
                .andWhere('ritasecoal_id', data.ritasecoal_id)
                .getSum('w_netto')

            const dailyRitaseCoal = await DailyRitaseCoal.findOrFail(data.ritasecoal_id, trx)
            dailyRitaseCoal.merge({
                coal_rit: coal_rit,
                tw_gross: tw_gross,
                tw_tare: tw_tare,
                tw_netto: tw_netto,
            })
            await dailyRitaseCoal.save(trx)

            await trx.commit()
            
            dailyPlan.merge({actual: tw_netto})
            await dailyPlan.save()
        }
    } catch (error) {
        console.log(error)
        await trx.rollback()
    }
}