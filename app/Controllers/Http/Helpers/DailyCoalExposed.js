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
            .paginate(halaman, limit)
        return data
    }

    async FILTER (req) {
        console.log(req);
        const data = await CoalExposed.query()
            .with('pit')
            .with('createdby')
            .where(w => {
                w.where('tgl', '>=', `${req.begin_date}`)
                .andWhere('tgl', '<=', `${req.end_date}`)
                .andWhere('pit_id', `${req.pid_id}`)
            })
            .andWhere('aktif', 'Y')
            .fetch()
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