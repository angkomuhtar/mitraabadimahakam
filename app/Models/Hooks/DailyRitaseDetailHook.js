'use strict'

const moment = require('moment')
const DailyPlan = use("App/Models/DailyPlan")
const DailyRitase = use("App/Models/DailyRitase")
const MasMaterial = use("App/Models/MasMaterial")
const MasEquipment = use("App/Models/MasEquipment")
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")

const DailyRitaseDetailHook = exports = module.exports = {}

DailyRitaseDetailHook.beforeInsertData = async (dailyritasedetail) => {
    const counter = await DailyRitaseDetail.query().where(
        { hauler_id: dailyritasedetail.hauler_id, dailyritase_id: dailyritasedetail.dailyritase_id }
    ).getCount()
    dailyritasedetail.urut = counter + 1

    const lastData = await DailyRitaseDetail.query().where(
        { hauler_id: dailyritasedetail.hauler_id, dailyritase_id: dailyritasedetail.dailyritase_id }
    ).last()

    dailyritasedetail.duration = lastData ? moment.duration(moment().diff(moment(lastData.check_in))).as('minutes') : -1

    const dailyRitase = await DailyRitase.findOrFail(dailyritasedetail.dailyritase_id)
    const totalRitase = await DailyRitaseDetail.query().where('dailyritase_id', dailyritasedetail.dailyritase_id).getCount()
    dailyRitase.merge({tot_ritase: totalRitase})
    await dailyRitase.save()
}

DailyRitaseDetailHook.afterInsertData = async (dailyritasedetail) => {

    const dailyRitase = await DailyRitase.findOrFail(dailyritasedetail.dailyritase_id)
    const totalRitase = await DailyRitaseDetail.query().where('dailyritase_id', dailyritasedetail.dailyritase_id).getCount()
    dailyRitase.merge({tot_ritase: totalRitase})
    await dailyRitase.save()

    /* GET CAPACITY HAULER */
    const hauler = await MasEquipment.findOrFail(dailyritasedetail.hauler_id)

    /* GET VOLUME MATERIAL */
    const volume = await MasMaterial.query().where('id', dailyRitase.material).last()

    /* GET PLAN DATE */
    const date = moment(dailyritasedetail.check_in).format('YYYY-MM-DD')
    const dailyPlan = await DailyPlan.query().where('current_date', date).first()
    dailyPlan.merge({
        actual: parseFloat(dailyPlan.actual) + parseFloat(volume.vol)
    })
    await dailyPlan.save()
}

DailyRitaseDetailHook.afterDeleteData = async (dailyritasedetail) => {

    const dailyRitase = await DailyRitase.findOrFail(dailyritasedetail.dailyritase_id)
    const totalRitase = await DailyRitaseDetail.query().where('dailyritase_id', dailyritasedetail.dailyritase_id).getCount()
    dailyRitase.merge({tot_ritase: totalRitase})
    await dailyRitase.save()

    /* GET CAPACITY HAULER */
    const hauler = await MasEquipment.findOrFail(dailyritasedetail.hauler_id)

    /* GET VOLUME MATERIAL */
    const volume = await MasMaterial.query().where('id', dailyRitase.material).last()

    /* GET PLAN DATE */
    const date = moment(dailyritasedetail.check_in).format('YYYY-MM-DD')
    const dailyPlan = await DailyPlan.query().where('current_date', date).first()
    dailyPlan.merge({
        actual: parseFloat(dailyPlan.actual) - parseFloat(volume.vol)
    })
    await dailyPlan.save()
}


DailyRitaseDetailHook.beforeUpdateData = async (dailyritasedetail) => {
    const lastData = await DailyRitaseDetail.query().where(
        { hauler_id: dailyritasedetail.hauler_id, dailyritase_id: dailyritasedetail.dailyritase_id }
    ).last()

    dailyritasedetail.duration = lastData ? moment.duration(moment().diff(moment(lastData.check_in))).as('minutes') : -1

    const dailyRitase = await DailyRitase.findOrFail(dailyritasedetail.dailyritase_id)
    const totalRitase = await DailyRitaseDetail.query().where('dailyritase_id', dailyritasedetail.dailyritase_id).getCount()
    dailyRitase.merge({tot_ritase: totalRitase})
    await dailyRitase.save()

}
