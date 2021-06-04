'use strict'

const moment = require('moment')
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
}


DailyRitaseDetailHook.beforeUpdateData = async (dailyritasedetail) => {
    const lastData = await DailyRitaseDetail.query().where(
        { hauler_id: dailyritasedetail.hauler_id, dailyritase_id: dailyritasedetail.dailyritase_id }
    ).last()

    dailyritasedetail.duration = lastData ? moment.duration(moment().diff(moment(lastData.check_in))).as('minutes') : -1
}
