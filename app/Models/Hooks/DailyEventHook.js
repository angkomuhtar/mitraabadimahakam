'use strict'

const moment = require('moment')
const DailyChecklistHook = exports = module.exports = {}

DailyChecklistHook.beforeADD = async (dailychecklist) => {
    await PARSEDATA_TIME(dailychecklist)
}

DailyChecklistHook.beforeUPDATE = async (dailychecklist) => {
    await PARSEDATA_TIME(dailychecklist)
}

async function PARSEDATA_TIME(data){
    if(data.start_at != null && data.end_at != null){
        var x = new moment(data.start_at)
        var y = new moment(data.end_at)
        var duration = moment.duration(y.diff(x)).as('minutes')
        data.time_duration = parseFloat(duration)
        data.total_smu = parseFloat(duration) / 60
    }
}