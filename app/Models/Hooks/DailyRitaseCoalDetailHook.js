'use strict'

const moment = require('moment')
const DailyPlan = use("App/Models/DailyPlan")
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
    try {
        if(data.checkout_jt){
            const dailyPlan = await DailyPlan.query(trx)
                .with('monthly_plan')
                .where('tipe', 'COAL')
                .andWhere('current_date', moment(data.checkout_pit).format('YYYY-MM-DD'))
                .first()
            
            const coal_rit = await DailyRitaseCoalDetail.query(trx).where('w_netto', '>', 0).getCount('ritasecoal_id')
            const tw_gross = await DailyRitaseCoalDetail.query(trx)
                .where(w => w.where('checkin_jt', '>=', awalBulan).andWhere('checkin_jt', '<=', data.checkin_jt))
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
            dailyPlan.merge({actual: tw_netto})
            await dailyPlan.save(trx)
            await trx.commit()
        }
    } catch (error) {
        console.log(error)
        await trx.rollback()
    }
}