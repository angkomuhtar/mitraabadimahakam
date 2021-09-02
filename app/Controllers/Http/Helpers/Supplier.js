'use strict'

const MasSupplier = use("App/Models/MasSupplier")


class Supplier {
    async ALL (req) {
        let supplier
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const limit = 25
        if(req.keyword){
            supplier = await MasSupplier
                .query()
                .where(w => {
                    w.where('kode', 'like', `%${req.keyword}%`)
                    .orWhere('name', 'like', `%${req.keyword}%`)
                    .orWhere('phone', 'like', `%${req.keyword}%`)
                    .orWhere('email', 'like', `%${req.keyword}%`)
                    .orWhere('address', 'like', `%${req.keyword}%`)
                })
                .andWhere('status', 'Y')
                .orderBy('name', 'asc')
                .paginate(halaman, limit)
        }else{
            supplier = await MasSupplier.query().andWhere('status', 'Y').orderBy('name', 'asc').paginate(halaman, limit)
        }
        
        return supplier
    }

    async GET_ID (params) {
        const supplier = await MasSupplier.query()
            .where('id', params.id)
            .first()
        return supplier
    }

    async GET_LAST () {
        const supplier = await MasSupplier.query().where('kode', 'like', `SUP%`).last()
        return supplier
    }

    async CHECK_KODE (req) {
        const supplier = await MasSupplier.query().where('kode', req.kode).last()
        return supplier ? true : false
    }

    async POST (req) {
        const supplier = new MasSupplier()
        supplier.fill(req)
        await supplier.save()
        return supplier
    }

    async UPDATE (params, req) {
        const supplier = await MasSupplier.query().where('id', params.id).first()
        supplier.merge(req)
        await supplier.save()
        return supplier
    }

    async DELETE (params) {
        const supplier = await MasSupplier.query().where('id', params.id).first()
        supplier.merge({status: 'N'})
        console.log(supplier.toJSON());
        await supplier.save()
        return supplier
    }
}

module.exports = new Supplier()