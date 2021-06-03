'use strict'

const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")

const DailyRitaseDetailHook = exports = module.exports = {}

DailyRitaseDetailHook.beforeInsertData = async (dailyritasedetail) => {
    const counter = await DailyRitaseDetail.query().getCount()
    dailyritasedetail.urut = counter + 1
}
