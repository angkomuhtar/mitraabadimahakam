'use strict'

const moment = require('moment')
const DailyRitase = use("App/Models/DailyRitase")
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
}

DailyRitaseDetailHook.afterDeleteData = async (dailyritasedetail) => {

    const dailyRitase = await DailyRitase.findOrFail(dailyritasedetail.dailyritase_id)
    const totalRitase = await DailyRitaseDetail.query().where('dailyritase_id', dailyritasedetail.dailyritase_id).getCount()
    dailyRitase.merge({tot_ritase: totalRitase})
    await dailyRitase.save()
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
