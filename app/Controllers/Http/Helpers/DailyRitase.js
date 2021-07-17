'use strict'

const DailyRitase = use("App/Models/DailyRitase")
const DailyRitaseDetail = use("App/Models/DailyRitaseDetail")

class Ritase {
    async ALL (req) { 
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        let dailyRitase
        if(req.keyword){
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
                    whe.where('material', 'like', `%${req.keyword}%`)
                    whe.orWhere('distance', 'like', `%${req.keyword}%`)
                    whe.orWhere('date', 'like', `%${req.keyword}%`)
                })
                .andWhere("status", "Y")
                .orderBy('created_at', 'desc')
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
                .orderBy('created_at', 'desc')
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