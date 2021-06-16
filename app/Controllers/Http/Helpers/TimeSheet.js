'use strict'

const DailyChecklist = use("App/Models/DailyChecklist")

class TimeSheet {
    async ALL (req) { 
        console.log(req);
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const dailyChecklist = await DailyChecklist
            .query()
            .with('dailyFleet', d => {
                d.with('fleet')
                d.with('pit')
                d.with('activities')
                d.with('shift')
            })
            .with('userCheck')
            .with('spv')
            .with('lead')
            .with('equipment')
            .with('p2h')
            .orderBy('tgl', 'desc')
            .paginate(halaman, limit)
        return dailyChecklist
    }
}

module.exports = new TimeSheet()