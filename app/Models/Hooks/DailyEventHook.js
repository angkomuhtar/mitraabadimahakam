'use strict'

const DailyChecklist = use("App/Models/DailyChecklist")

const DailyChecklistHook = exports = module.exports = {}

DailyChecklistHook.beforeADD = async (dailychecklist) => {
    await PARSEDATA_TIME(dailychecklist)
}

DailyChecklistHook.beforeUPDATE = async (dailychecklist) => {
    await PARSEDATA_TIME(dailychecklist)
}

async function PARSEDATA_TIME(data){
    if(data.time_duration){
        data.total_smu = parseFloat(data.time_duration) / 60
    }else{
        data.time_duration = 60 * parseFloat(data.total_smu)
    }
}