'use strict'

const DailyChecklist = use("App/Models/DailyChecklist")

class TimeSheet {
    async ALL (req) { 
        console.log('req', req);
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let dailyChecklist
        if(req.keyword){
            dailyChecklist = await DailyChecklist
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
                .where(w => {
                    w.where('description', 'like', `%${req.keyword}%`)
                    .orWhere('tgl', 'like', `${req.keyword}`)
                })
                .orderBy('tgl', 'desc')
                .paginate(halaman, limit)
        }else{
            dailyChecklist = await DailyChecklist
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
                .with('operator_unit')
                .with('equipment')
                .with('p2h')
                .orderBy('tgl', 'desc')
                .paginate(halaman, limit)
        }
        return dailyChecklist
    }

    async GET_ID (params){
        // const dailyChecklist = await DailyChecklist.findOrFail(params.id)
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
            .with('operator_unit')
            .with('equipment')
            .with('p2h')
            .where('id', params.id)
            .first()
        return dailyChecklist
    }
}

module.exports = new TimeSheet()