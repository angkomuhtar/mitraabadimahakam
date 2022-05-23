'use strict'

const MasBarang = use("App/Models/MasBarang")


class masBarang {
    async ALL (req) {
        let barang
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        const limit = 100
        if(req.keyword){
            barang = await MasBarang
                .query()
                .where(w => {
                    if(req.keyword){
                        w.where('kode', 'like', `%${req.keyword}%`)
                        .orWhere('partnumber', 'like', `%${req.keyword}%`)
                        .orWhere('descriptions', 'like', `%${req.keyword}%`)
                    }
                    if(req.control_acc){
                        w.where('control_acc', req.control_acc)
                    }
                    if(req.parttype){
                        w.where('parttype', req.parttype)
                    }
                    if(req.manufactur){
                        w.where('manufactur', req.manufactur)
                    }
                    if(req.equiptype){
                        w.where('equiptype', req.equiptype)
                    }
                })
                .orderBy('kode', 'asc')
                .paginate(halaman, limit)
        }else{
            barang = await MasBarang.query().orderBy('kode', 'asc').paginate(halaman, limit)
        }
        
        return barang
    }

    async GET_ID (params) {
        const barang = await MasBarang.query()
            .where('id', params.id)
            .first()
        return barang
    }

    async GET_LAST () {
        const barang = await MasBarang.query().where('kode', 'like', `SUP%`).last()
        return barang
    }

    async CHECK_KODE (req) {
        const barang = await MasBarang.query().where('kode', req.kode).last()
        return barang ? true : false
    }

    async POST (req, user) {
        const barang = new MasBarang()
        barang.fill({
            kode: req.kode,
            control_acc: req.control_acc || '',
            partnumber: req.partnumber,
            descriptions: req.descriptions,
            parttype: req.parttype || '',
            manufactur: req.manufactur || '',
            equiptype: req.equiptype || '',
            planmodel: req.planmodel || '',
            uom: req.uom || '',
            remark: req.remark || '',
            user_id: user.id
        })
        try {
            await barang.save()
            return barang
        } catch (error) {
            console.log(error);
            throw new Error('Error save barang...')
        }
    }

    async UPDATE (params, req, user) {
        const barang = await MasBarang.query().where('id', params.id).first()
        barang.merge({
            control_acc: req.control_acc,
            kode: req.kode,
            partnumber: req.partnumber,
            descriptions: req.descriptions,
            parttype: req.parttype,
            manufactur: req.manufactur,
            equiptype: req.equiptype,
            planmodel: req.planmodel,
            uom: req.uom,
            remark: req.remark,
            user_id: user.id
        })
        try {
            await barang.save()
            return barang
            
        } catch (error) {
            console.log(error);
            throw new Error('Error save barang...')
        }
    }

    async DELETE (params) {
        const barang = await MasBarang.query().where('id', params.id).first()
        barang.merge({status: 'N'})
        console.log(barang.toJSON());
        await barang.save()
        return barang
    }
}

module.exports = new masBarang()