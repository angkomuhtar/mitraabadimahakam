'use strict'

const MonthlyPlanHelpers = use("App/Controllers/Http/Helpers/MonthlyPlan")

class AjaxChartController {
    async grafik_OB_MTD () {
        const data = await MonthlyPlanHelpers.CHARTIST_MONTHLY()
        
        return data
    }
}

module.exports = AjaxChartController
