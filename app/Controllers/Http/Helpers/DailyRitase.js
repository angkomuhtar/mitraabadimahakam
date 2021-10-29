'use strict'

const DailyFleet = use("App/Models/DailyFleet")
const DailyRitase = use("App/Models/DailyRitase")
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")

class Ritase {
    async ALL (req) { 
        const limit = parseInt(req.limit)
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let dailyRitase
        let arrFilter
        if(req.keyword){
            const fleet = await DailyFleet.query().where(w => {
                
                if(req.fleet_id){
                    w.where('fleet_id', req.fleet_id)
                }

                if(req.shift_id){
                    w.where('shift_id', req.shift_id)
                }
            }).fetch()

            if(fleet){
                arrFilter = fleet.toJSON().map(item => item.id)
            }

            console.log(req);

            dailyRitase = await DailyRitase
                .query()
                .with('material_details')
                .with('ritase_details', item => {
                    item.with('checker', b => b.with('profile'))
                    item.with('spv', b => b.with('profile'))
                    item.with('hauler')
                })
                .with('daily_fleet', details => {
                    details.with('details', unit => unit.with('equipment'))
                    details.with('shift')
                    details.with('activities')
                    details.with('fleet')
                    details.with('pit')
                })
                .where(whe => {
                    if(req.distance){
                        whe.where('distance', req.distance)
                    }

                    if(req.material){
                        whe.where('material', req.material)
                    }

                    if(req.exca_id){
                        whe.where('exca_id', req.exca_id)
                    }

                    if(arrFilter.length > 0){
                        whe.where("status", "Y")
                        if(req.begin_date){
                            whe.where('date', '>=', req.begin_date)
                            whe.where('date', '<=', req.end_date)
                        }
                        whe.whereIn('dailyfleet_id', arrFilter)
                    }else{
                        if(req.begin_date){
                            whe.where('date', '>=', req.begin_date)
                            whe.where('date', '<=', req.end_date)
                        }
                        whe.where("status", "Y")
                    }
                })
                .orderBy('date', 'desc')
                .paginate(halaman, limit)
        }else{
            dailyRitase = await DailyRitase
                .query()
                .with('material_details')
                .with('ritase_details', item => {
                    item.with('checker', b => b.with('profile'))
                    item.with('spv', b => b.with('profile'))
                    item.with('hauler')
                    item.orderBy('created_at', 'desc')
                })
                .with('daily_fleet', details => {
                    details.with('details', unit => unit.with('equipment'))
                    details.with('shift')
                    details.with('activities')
                    details.with('fleet')
                    details.with('pit')
                })
                .where("status", "Y")
                .orderBy('date', 'desc')
                .paginate(halaman, limit)
        }
        return dailyRitase
    }

    async BY_PIT (params, req) {
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const dailyRitaseDetail = await DailyRitaseDetail
            .query()
            .with('daily_ritase', a => {
                a.with('daily_fleet', b => {
                    b.with('pit')
                    b.with('fleet')
                    b.with('shift')
                    b.where('pit_id', params.pit_id)
                })
                a.with('material_details')
            })
            .with('checker', b => b.with('profile'))
            .with('hauler')
            .orderBy('check_in', 'desc')
            .paginate(halaman, limit)
        return dailyRitaseDetail
    }

    async BY_FLEET (params, req) {
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const dailyRitaseDetail = await DailyRitaseDetail
            .query()
            .with('daily_ritase', a => {
                a.with('daily_fleet', b => {
                    b.with('pit')
                    b.with('fleet')
                    b.with('shift')
                    b.where('fleet_id', params.fleet_id)
                })
                a.with('material_details')
            })
            .with('checker', b => b.with('profile'))
            .with('hauler')
            .orderBy('check_in', 'desc')
            .paginate(halaman, limit)
        return dailyRitaseDetail
    }

    async BY_SHIFT (params, req) {
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const dailyRitaseDetail = await DailyRitaseDetail
            .query()
            .with('daily_ritase', a => {
                a.with('daily_fleet', b => {
                    b.with('pit')
                    b.with('fleet')
                    b.with('shift')
                    b.where('shift_id', params.shift_id)
                })
                a.with('material_details')
            })
            .with('checker', b => b.with('profile'))
            .with('hauler')
            .orderBy('check_in', 'desc')
            .paginate(halaman, limit)
        return dailyRitaseDetail
    }

    async BY_RIT_ID (req) {
        const limit = 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const dailyRitaseDetail = await DailyRitaseDetail
            .query()
            .with('daily_ritase', wh => wh.where('id', req.id))
            .with('checker', b => b.with('profile'))
            .with('spv', b => b.with('profile'))
            .orderBy('check_in', 'desc')
            .paginate(halaman, limit)
        return dailyRitaseDetail
    }

    async ID_SHOW (params) {
        const dailyRitase = await DailyRitase
            .query()
            .with('material_details')
            .with('ritase_details', item => {
                item.with('checker', b => b.with('profile'))
                item.with('spv', b => b.with('profile'))
                item.with('hauler')
            })
            .with('daily_fleet', details => {
                details.with('details', unit => unit.with('equipment'))
                details.with('shift')
                details.with('activities')
                details.with('fleet')
                details.with('pit')
            })
            .where("id", params.id)
            .first()
        return dailyRitase
    }

    async RITASE_BY_DAILY_ID (req) {
        const dailyRitaseDetail = await DailyRitaseDetail
            .query()
            .with('daily_ritase')
            .with('hauler')
            .with('checker', b => b.with('profile'))
            .with('spv', b => b.with('profile'))
            .where('dailyritase_id', req.id)
            .orderBy([{ column: 'hauler_id', order: 'desc' }, { column: 'check_in', order: 'desc' }])
            .fetch()
        return dailyRitaseDetail
    }

    async POST_RITASE_OB (params, req) {
        const dailyRitase = await DailyRitase.find(params.id)
        try {
            dailyRitase.merge(req)
            await dailyRitase.save()
            return dailyRitase
        } catch (error) {
            return null
        }
    }
}

module.exports = new Ritase()