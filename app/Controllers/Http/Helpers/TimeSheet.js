'use strict'

const db = use('Database')
const MasP2H = use("App/Models/MasP2H")
const DailyEvent = use("App/Models/DailyEvent")
const DailyCheckp2H = use("App/Models/DailyCheckp2H")
const DailyRefueling = use("App/Models/DailyRefueling")
const DailyChecklist = use("App/Models/DailyChecklist")

class TimeSheet {
    async ALL (req) { 
        console.log('req', req);
        const limit = 25
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
                .with('dailyEvent')
                .where(w => {
                    w.where('description', 'like', `%${req.keyword}%`)
                    .orWhere('tgl', 'like', `${req.keyword}`)
                })
                .orderBy('created_at', 'desc')
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
                .with('dailyEvent')
                .orderBy('created_at', 'desc')
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
            .with('userCheck', u => u.with('profile'))
            .with('spv', u => u.with('profile'))
            .with('lead')
            .with('operator_unit')
            .with('equipment')
            .with('p2h')
            .with('dailyEvent')
            .with('dailyRefueling')
            .where('id', params.id)
            .first()
        return dailyChecklist
    }

    async UPDATE (params, req) {
        const trx = await db.beginTransaction()
        try {
            
            const { p2h, event, refueling } = req
            const dailyChecklist = await DailyChecklist.find(params.id)

            if(refueling){
                throw new Error('Data Pengisian Bahan Bakar tdk valid...')
            }
    
            if(refueling.topup === '' || refueling.topup < 0){
                throw new Error('Jumlah Topup Fuel tdk valid...')
            }
    
            if(refueling.smu === '' || refueling.topup < 0){
                throw new Error('Input SMU Refuel Unit tdk valid...')
            }
            
    
            const dataMerge = {
                user_chk: req.user_chk, 
                user_spv: req.user_spv, 
                operator: req.operator, 
                unit_id: req.unit_id,
                tgl: req.tgl,
                dailyfleet_id: req.dailyfleet_id,
                description: req.description, 
                begin_smu: dailyChecklist.begin_smu,
                end_smu: req.end_smu
            }
    
            dailyChecklist.merge(dataMerge)
            await dailyChecklist.save(trx)

            let dailyRefueling = await DailyRefueling.query().where({timesheet_id: params.id, equip_id: refueling.equip_id}).first()
            if(dailyRefueling){
                dailyRefueling.merge(refueling)
            }else{
                dailyRefueling = new DailyRefueling()
                dailyRefueling.fill(refueling)
            }
            await dailyRefueling.save(trx)
            
            await dailyChecklist.p2h().detach(null, null, trx)
            let arrP2H = []
            for (const item of p2h) {
                let p2h_item = await MasP2H.findOrFail(item.p2h_id, trx)
                arrP2H.push({
                    checklist_id: dailyChecklist.id, 
                    p2h_id: p2h_item.id, 
                    is_check: item.is_check, 
                    description: item.description
                })
            }
            await DailyCheckp2H.createMany(arrP2H, trx)
            
            
            await DailyEvent.query(trx).where('timesheet_id', params.id).delete()
            for (const item of event) {
                delete item['id']
                const dailyEvent = new DailyEvent()
                dailyEvent.fill(item)
                await dailyEvent.save(trx)
            }


            await trx.commit(trx)

            return await DailyChecklist
                .query()
                .with('userCheck')
                .with('spv')
                .with('lead')
                .with('operator_unit')
                .with('equipment', a => {
                    a.with('daily_smu', whe => whe.limit(10).orderBy('id', 'desc'))
                })
                .with('dailyFleet', b => {
                    b.with('pit')
                    b.with('fleet')
                    b.with('activities')
                    b.with('shift')
                })
                .with('p2h')
                .with('dailyEvent')
                .where({id: params.id})
                .first()
            
        } catch (error) {
            console.log(error);
            await trx.rollback(trx)
            return error.message
        }
    }
}

module.exports = new TimeSheet()