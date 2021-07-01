'use strict'

const MonthlyPlanHelpers = use("App/Controllers/Http/Helpers/MonthlyPlan")
const moment = require('moment')

class AjaxChartController {
    async grafik_OB_MTD ({ request }) {
        const req = request.all()
        const grafik1 = await MonthlyPlanHelpers.CHARTIST_MONTHLY(req)
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
}

module.exports = AjaxChartController
