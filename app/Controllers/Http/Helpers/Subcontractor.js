'use strict'

const MasSubContractor = use("App/Models/MasSubContractor")
const MasEmployeeSubcont = use("App/Models/MasEmployeeSubcont")
const MasEquipmentSubcont = use("App/Models/MasEquipmentSubcont")

class Subcont {
    async SUBCONT_OPTIONS () {
        let data = await MasSubContractor.query().where('aktif', 'Y').fetch()
        return data
    }

    async SUBCONT_LIST (req) {
        let data = []
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        if(req.keyword){
            data = await MasSubContractor
                .query()
                .where(w => {
                    w.where('kode', 'like', `%${req.keyword}%`)
                    .orWhere('name', 'like', `%${req.keyword}%`)
                    .orWhere('phone', 'like', `%${req.keyword}%`)
                    .orWhere('email', 'like', `%${req.keyword}%`)
                })
                .andWhere('aktif', 'Y')
                .paginate(halaman, limit)
        }else{
            data = await MasSubContractor.query().where('aktif', 'Y').paginate(halaman, limit)
        }

        return data
    }

    async SUBCONT_SHOW (params) {
        const data = await MasSubContractor.query().where('id', params.id).last()
        return data
    }

    async SUBCONT_POST (req) {
        const masSubContractor = new MasSubContractor()
        masSubContractor.fill(req)
        return await masSubContractor.save()

    }

    async SUBCONT_UPDATE (params, req) {
        const masSubContractor = await MasSubContractor.find(params.id)
        masSubContractor.merge(req)
        return await masSubContractor.save()

    }

    async EQUIPMENT_LIST (req) {
        let data = []
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        if(req.keyword){
            data = await MasEquipmentSubcont
                .query()
                .with('subcon')
                .where(w => {
                    w.where('kode', 'like', `%${req.keyword}%`)
                    .orWhere('brand', 'like', `%${req.keyword}%`)
                    .orWhere('tipe', 'like', `%${req.keyword}%`)
                })
                .andWhere('aktif', 'Y')
                .paginate(halaman, limit)
        }else{
            data = await MasEquipmentSubcont.query().with('subcon').where('aktif', 'Y').paginate(halaman, limit)
        }

        return data
    }

    async EQUIPMENT_SHOW (params) {
        const data = await MasEquipmentSubcont.query().where('id', params.id).last()
        return data
    }

    async EQUIPMENT_POST (req) {
        req.kode = (req.kode).toUpperCase()
        console.log(req);
        const masEquipmentSubcont = new MasEquipmentSubcont()
        masEquipmentSubcont.fill(req)
        return await masEquipmentSubcont.save()

    }

    async EQUIPMENT_UPDATE (params, req) {
        const masEquipmentSubcont = await MasEquipmentSubcont.find(params.id)
        masEquipmentSubcont.merge(req)
        return await masEquipmentSubcont.save()

    }

    async EMPLOYEE_LIST (req) {
        let data = []
        const limit = 10
        const halaman = req.page === undefined ? 1:parseInt(req.page)
        if(req.keyword){
            data = await MasEmployeeSubcont
                .query()
                .with('subcon')
                .where(w => {
                    w.where('fullname', 'like', `%${req.keyword}%`)
                    .orWhere('position', 'like', `%${req.keyword}%`)
                })
                .andWhere('aktif', 'Y')
                .paginate(halaman, limit)
        }else{
            data = await MasEmployeeSubcont.query().with('subcon').where('aktif', 'Y').paginate(halaman, limit)
        }

        return data
    }

    async EMPLOYEE_SHOW (params) {
        const data = await MasEmployeeSubcont.query().where('id', params.id).last()
        return data
    }

    async EMPLOYEE_POST (req) {
        console.log(req);
        const masEmployeeSubcont = new MasEmployeeSubcont()
        masEmployeeSubcont.fill(req)
        return await masEmployeeSubcont.save()

    }

    async EMPLOYEE_UPDATE (params, req) {
        const masEmployeeSubcont = await MasEmployeeSubcont.find(params.id)
        masEmployeeSubcont.merge(req)
        return await masEmployeeSubcont.save()

    }

    // Func API

    async SUBCON_EQUIPMENT (params) {
        const data = await MasEquipmentSubcont.query().where('subcont_id', params.id).fetch()
        return data
    }

}

module.exports = new Subcont()