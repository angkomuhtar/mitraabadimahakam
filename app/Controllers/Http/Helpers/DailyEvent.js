'use strict'

const EventTimeSheet = use("App/Models/DailyEvent")
const TimeSheet = use("App/Models/DailyChecklist")
const Event = use("App/Models/MasEvent")

class DailyEventTimeSheet {
    async ALL (req) {
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let eventTimeSheet
        if(req.keyword){
            eventTimeSheet = 
            await EventTimeSheet
            .query()
            .with('timesheet', (wh) => {
                wh.with('dailyFleet', (w) => {
                    w.with('shift')
                })
            })
            .with('event')
            .with('equipment')
            .with('createdby')
            .where('description', 'like', `%${req.keyword}%`)
            .paginate(halaman, limit)
        }else{
            eventTimeSheet = 
            await EventTimeSheet
            .query()
            .with('timesheet', (wh) => {
                wh.with('dailyFleet', (w) => {
                    w.with('shift')
                })
            })
            .with('event')
            .with('equipment')
            .with('createdby')
            .paginate(halaman, limit)
        }

        return eventTimeSheet
    }

    async TIMESHEET_ID (params, req) {
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const eventTimeSheet = 
        await EventTimeSheet
        .query()
        .with('timesheet')
        .with('event')
        .with('equipment')
        .with('createdby')
        .where('timesheet_id', params.timesheetID)
        .paginate(halaman, limit)
        
        return eventTimeSheet
    }
    
    async EQUIPMENT_ID (params, req) {
        console.log(params);
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const eventTimeSheet = 
            await EventTimeSheet
            .query()
            .with('timesheet')
            .with('event')
            .with('equipment')
            .with('createdby')
            .where('equip_id', params.equipmentID)
            .paginate(halaman, limit)

        return eventTimeSheet
    }

    async POST (params, req) { 
        const isAvalilable = await TimeSheet.query().where({id: params.id, unit_id: req.equip_id}).first()
        if(!isAvalilable){
            throw new Error("Equipment unit unavailble on this TimeSheet...") 
        }

        const engineOFF = await Event.find(req.event_id)
        if(engineOFF.engine === 'off'){
            const validDatetime = await EventTimeSheet.query()
                .where(w => {
                    w.where('start_at', '<=', req.start_at)
                    .andWhere('end_at', '>=', req.start_at)
                    .andWhere('equip_id', req.equip_id)
                    .andWhere('timesheet_id', params.id)
                })
                .orWhere(o => {
                    o.where('start_at', '<=', req.end_at)
                    .andWhere('end_at', '>=', req.end_at)
                    .andWhere('equip_id', req.equip_id)
                    .andWhere('timesheet_id', params.id)
                })
                .getCount()
            if(validDatetime > 0){
                throw new Error("Event dengan status engine off sudah ada pada range waktu ini...") 
            }
        }

        if(engineOFF.engine === 'on'){
            const validDatetime = await EventTimeSheet.query()
                .where(w => {
                    w.where('start_at', '<=', req.start_at)
                    .andWhere('end_at', '>=', req.start_at)
                    .andWhere('equip_id', req.equip_id)
                    .andWhere('timesheet_id', params.id)
                })
                .orWhere(o => {
                    o.where('start_at', '<=', req.end_at)
                    .andWhere('end_at', '>=', req.end_at)
                    .andWhere('equip_id', req.equip_id)
                    .andWhere('timesheet_id', params.id)
                })
                .getCount()
            if(validDatetime > 0){
                throw new Error("Equipment Unit berada pada event lain dalam range waktu ini ...") 
            }
        }

        const eventTimeSheet = new EventTimeSheet()
        eventTimeSheet.fill({
            timesheet_id: params.id,
            event_id: req.event_id,
            user_id: req.user_id,
            equip_id: req.equip_id,
            description: req.description,
            start_at: req.start_at,
            end_at: req.end_at,
            engine: engineOFF.engine
        })
        await eventTimeSheet.save()
        return eventTimeSheet
    }

    async DELETE(params){
        const eventTimeSheet = await EventTimeSheet.find(params.dailyEventID)
        if(eventTimeSheet){
            await eventTimeSheet.delete()
            return eventTimeSheet
        }else{
            throw new Error('Data daily event ID ::'+params.dailyEventID+' not found...')
        }
    }
}

module.exports = new DailyEventTimeSheet()
