'use strict'

const moment = require('moment')
const DailyEventHook = exports = module.exports = {}

DailyEventHook.beforeADD = async (dailyevent) => {
    await PARSEDATA_TIME(dailyevent)
}

DailyEventHook.beforeUPDATE = async (dailyevent) => {
    await PARSEDATA_TIME(dailyevent)
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