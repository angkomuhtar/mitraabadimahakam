'use strict'

const MasEvent = use("App/Models/MasEvent")


class Events {
    async ALL (req) {
        let masEvent
        if(req.keyword){
            masEvent = 
                await MasEvent
                .query()
                .where('narasi', 'like', `%${req.keyword}%`)
                .andWhere('aktif', 'Y')
                .fetch()
        }else{
            masEvent = await MasEvent.query().where({aktif: 'Y'}).fetch()
        }
        
        return masEvent
    }

    async ALL_ (req) {
        let masEvent
        const limit = 20
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        if(req.keyword){
            masEvent = 
                await MasEvent
                .query()
                .where(w => {
                    w.where('kode', 'like', `%${req.keyword}%`)
                    .orWhere('narasi', 'like', `%${req.keyword}%`)
                    .orWhere('satuan', 'like', `%${req.keyword}%`)
                    .orWhere('status', 'like', `%${req.keyword}%`)
                })
                .andWhere('aktif', 'Y')
                .paginate(halaman, limit)
        }else{
            masEvent = await MasEvent.query().where({aktif: 'Y'}).paginate(halaman, limit)
        }
        
        return masEvent
    }

    async SHOW (params) {
        const masEvent = await MasEvent.query().where('id', params.id).last()
        return masEvent
    }

    async POST (req) {
        const masEvent = new MasEvent()
        masEvent.fill(req)
        await masEvent.save()
        return masEvent
    }

    async UPDATE (params, req) {
        const masEvent = await MasEvent.query().where('id', params.id).last()
        masEvent.merge(req)
        await masEvent.save()
        return masEvent
    }

    async DELETE (params) {
        const masEvent = await MasEvent.query().where('id', params.id).last()
        await masEvent.delete()
        return masEvent
    }
}

module.exports = new Events()