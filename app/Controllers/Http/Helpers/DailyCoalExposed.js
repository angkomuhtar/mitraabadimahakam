'use strict'

const CoalExposed = use("App/Models/DailyCoalExposed")

class DailyCoalExposed {
    async ALL (req) {
        const limit = 25
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const data = await CoalExposed.query()
            .with('pit')
            .with('createdby')
            .where('aktif', 'Y')
            .orderBy('tgl', 'desc')
            .paginate(halaman, limit)
        return data
    }

    async FILTER (req) {
        const limit = 50
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const data = await CoalExposed.query()
            .with('pit')
            .with('createdby')
            .where(w => {
                if(req.pit_id){
                    w.where('pit_id', `${req.pit_id}`)
                }
                if(req.begin_date){
                    w.where('tgl', '>=', `${req.begin_date}`)
                    w.where('tgl', '<=', `${req.end_date}`)
                }
                w.where('aktif', 'Y')
            })
            .orderBy('tgl', 'desc')
            .paginate(halaman, limit)
        return data
    }

    async GET_ID (params) {
        const data = await CoalExposed.query()
            .with('pit')
            .with('createdby')
            .where('id', params.id)
            .last()
        return data
    }

    async POST (req) {
        const coalExposed = new CoalExposed()
        coalExposed.fill(req)
        return await coalExposed.save()
    }

    async UPADTE (params, req) {
        const coalExposed = await CoalExposed.query().where('id', params.id).last()
        coalExposed.merge(req)
        return await coalExposed.save()
    }

    async DELETE (params) {
        const coalExposed = await CoalExposed.query().where('id', params.id).last()
        coalExposed.merge({aktif: 'N'})
        return await coalExposed.save()
    }
}

module.exports = new DailyCoalExposed()