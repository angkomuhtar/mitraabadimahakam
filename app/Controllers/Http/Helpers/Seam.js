'use strict'

const MasSeam = use("App/Models/MasSeam")


class CoalSeam {
    async ALL (req) {
        let coalSeam
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const limit = 10
        if(req.keyword){
            coalSeam = await MasSeam
                .query()
                .with('pit', w => w.with('site'))
                .where('kode', 'like', `%${req.keyword}%`)
                .andWhere('aktif', 'Y')
                .paginate(halaman, limit)
        }else{
            coalSeam = await MasSeam
                .query()
                .with('pit', w => w.with('site'))
                .where('aktif', 'Y')
                .paginate(halaman, limit)
        }
        
        return coalSeam
    }

    async GET_PIT_ID (params) {
        const coalSeam = await MasSeam.query()
            .with('pit')
            .where(w => {
                w.where('pit_id', params.pit_id)
                w.where('aktif', 'Y')
            })
            .fetch()
        return coalSeam
    }

    async GET_ID (params) {
        const coalSeam = await MasSeam.query()
            .with('pit', w => w.with('site'))
            .where('id', params.id)
            .first()
        return coalSeam
    }

    async POST (req) {
        const coalSeam = new MasSeam()
        coalSeam.fill(req)
        await coalSeam.save()
        return coalSeam
    }

    async UPDATE (params, req) {
        const coalSeam = await MasSeam.query().where('id', params.id).first()
        coalSeam.merge(req)
        await coalSeam.save()
        return coalSeam
    }

    async DELETE (params) {
        const coalSeam = await MasSeam.query().where('id', params.id).first()
        await coalSeam.delete()
        return coalSeam
    }
}

module.exports = new CoalSeam()