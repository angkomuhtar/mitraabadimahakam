'use strict'

const DailyChecklist = use("App/Models/DailyChecklist")

const DailyChecklistHook = exports = module.exports = {}

DailyChecklistHook.beforeADD = async (dailychecklist) => {
    
}

DailyChecklistHook.beforeUPDATE = async (dailychecklist) => {
    const dailyChecklist = await DailyChecklist.findOrFail(dailychecklist.id)

    var smu_awal = parseFloat(dailyChecklist.begin_smu)
    var smu_akhir = parseFloat(dailychecklist.end_smu)

    if(smu_awal <= smu_akhir){
        dailychecklist.used_smu = smu_akhir - smu_awal
    }

    if(dailychecklist.end_smu){
        dailychecklist.finish_at = new Date()
    }
}
