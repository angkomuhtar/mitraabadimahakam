'use strict'
const db = use('Database')
const _ = use('underscore')
const moment = require('moment')
const Barang = use("App/Models/MasBarang")
const BarangOut = use("App/Models/MamBarangOut")
const MamBarangStok = use("App/Models/MamBarangStok")
const utils = use('App/Controllers/Http/customClass/utils')
const LogMaterialRequest = use("App/Models/LogMaterialRequest")
const MamPurchasingRequest = use("App/Models/MamPurchasingRequest")
const MamPurchasingCategory = use("App/Models/MamPurchasingCategory")
const LogMaterialRequestItem = use("App/Models/LogMaterialRequestItem")
const MamPurchasingRequestItem = use("App/Models/MamPurchasingRequestItem")


class mamMaterialRequestCheck {
    async LIST (req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const materialRequest = await LogMaterialRequest.query()
        .with('site')
        .with('pit')
        .with('author')
        .with('approved')
        .with('department')
        .with('items', i => i.where('aktif', 'Y'))
        .where( w  => {
            w.whereIn('status', ['ready', 'done'])
            if (req.kode) {
                w.where('kode', 'like', `%${req.kode}%`)
            }
            if (req.department_id) {
                w.where('department_id', req.department_id)
            }
            if (req.pit_id) {
                w.where('priority', req.pit_id)
            }
            if (req.status) {
                w.where('status', req.status)
            }
            if (req.begin_date && req.end_date) {
                w.where('date', '>=', req.begin_date)
                w.where('date', '<=', req.end_date)
            }
        }).orderBy([{column: 'date', order: 'desc'}, {column: 'kode', order: 'asc'}]).paginate(halaman, limit)

        let data = materialRequest.toJSON()
        return data
    }
    
    async SHOW (params) {
        const materialRequest = (
            await LogMaterialRequest.query()
            .with('site')
            .with('pit')
            .with('author')
            .with('approved')
            .with('department')
            .with('items', i => {
                i.with('barang')
                i.with('equipment')
                i.where('aktif', 'Y')
                i.where('status', 'pending')
            })
            .where('id', params.id).last()
        ).toJSON()
        return materialRequest
    }

    async POST (req, user) {

        const trx = await db.beginTransaction()
        
        let materialRequest = new LogMaterialRequest()

        try {
            materialRequest.fill({
                gudang_id: req.gudang_id || null,
                site_id: req.site_id || null,
                pit_id: req.pit_id || null,
                department_id: req.department_id,
                priority: req.priority,
                narasi: req.narasi || '',
                request_by: user.id,
                date: new Date(),
                kode: req.kode
            })
            await materialRequest.save(trx)
        } catch (error) {
            console.log(error);
            await trx.rollback()
            return {
                success: false,
                message: 'Failed save Material Request,,,'
            }
        }

        for (const obj of req.items) {

            let materialRequestItem = new LogMaterialRequestItem()
            try {
                materialRequestItem.fill({
                    material_req_id: materialRequest.id,
                    barang_id: obj.barang_id,
                    qty: obj.qty,
                    narasi: '',
                    equipment_reff: obj.equipment_reff || null
                })
                await materialRequestItem.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed save Material Request Items,,,'
                }
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success save Material Request,,,'
        }
    }

    async CHECK (params, user) {
        const materialRequest = await LogMaterialRequest.query().where('id', params.id).last()

        try {
            materialRequest.merge({
                approved_at: new Date(),
                status: 'ready',
                approved_by: user.id
            })
            await materialRequest.save()
        } catch (error) {
            console.log(error);
            return {
                success: false,
                message: error
            }
        }

        return {
            success: true,
            message: 'Data success approved...'
        }
    }

    async UPDATE (req, params, user) {
        const trx = await db.beginTransaction()
        const materialRequest = await LogMaterialRequest.query().where('id', params.id).last()

        try {
            materialRequest.merge({
                site_id: req.site_id || null,
                pit_id: req.pit_id || null,
                department_id: req.department_id,
                narasi: req.narasi || '',
                priority: req.priority,
                request_by: user.id,
                date: new Date()
            })
            await materialRequest.save(trx)
        } catch (error) {
            console.log(error);
            await trx.rollback()
            return {
                success: false,
                message: error
            }
        }

        /** UPDATE INACTIVE STATUS ITEM **/
        const itemsMaterial = (await LogMaterialRequestItem.query().where('material_req_id', params.id).fetch()).toJSON()
        for (const val of itemsMaterial) {
            const itemInactive = await LogMaterialRequestItem.query().where('id', val.id).last()
            try {
                itemInactive.merge({
                    aktif: 'N',
                    narasi: 'item diupdate oleh user'
                })
                await itemInactive.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: error
                }
            }
        }

        /** REINSERT MATERIAL REQUEST ITEM **/
        for (const obj of req.items) {
            const materialRequestItem = new LogMaterialRequestItem()
            try {
                materialRequestItem.fill({
                    material_req_id: params.id,
                    barang_id: obj.barang_id,
                    qty: obj.qty,
                    narasi: '',
                    equipment_reff: obj.equipment_reff || null
                })
                await materialRequestItem.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed save Material Request Items,,,'
                }
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success save Material Request,,,'
        }
    }

    async OUT_ITEMS (req, user) {
        const trx = await db.beginTransaction()

        for (const val of req.items) {
            const barangOut = new BarangOut()
            barangOut.fill({
                request_id: req.request_id,
                gudang_id: req.gudang_id,
                barang_id: val.barang_id,
                date: new Date(),
                qty_out: val.qty,
                created_by: user.id
            })
            console.log(barangOut.toJSON());
            try {
                await barangOut.save(trx)
            } catch (error) {
                console.log('AAA', error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed save items out...'
                }
            }
        }

        for (const obj of req.items) {

            const materialRequestItem = await LogMaterialRequestItem.query().where( w => {
                w.where('material_req_id', req.request_id)
                w.where('barang_id', obj.barang_id)
                w.where('aktif', 'Y')
            }).last()

            if(materialRequestItem){
                var valQty = parseFloat(materialRequestItem.qty_accept) + parseFloat(obj.qty)
                materialRequestItem.merge({
                    qty_accept: materialRequestItem.qty_accept + obj.qty,
                    status: valQty >= materialRequestItem.qty ? 'out':'pending'
                })
                try {
                    await materialRequestItem.save(trx)
                } catch (error) {
                    console.log('BBB', error);
                    await trx.rollback()
                    return {
                        success: false,
                        message: 'Failed update items material status...'
                    }
                }
            }
        }

        for (const obj of req.items) {
            let mamBarangStok = await MamBarangStok.query().where(w => {
                w.where('barang_id', obj.barang_id)
                w.where('gudang_id', req.gudang_id)
            }).last()

            if(mamBarangStok){
                mamBarangStok.merge({
                    stok: mamBarangStok.stok - obj.qty,
                    remark: user.nm_lengkap + ' mengeluarkan barang dari stok gudang'
                })
            }else{
                mamBarangStok = new MamBarangStok()
                mamBarangStok.fill({
                    barang_id: obj.barang_id,
                    gudang_id: req.gudang_id,
                    stok: (obj.qty) * -1,
                    remark: user.nm_lengkap + ' mengeluarkan barang dari stok gudang'
                })
            }

            try {
                await mamBarangStok.save(trx)
            } catch (error) {
                console.log('CCC', error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed update items material status...'
                }
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success save items out...'
        }
    }

    async PURCHASING_REQ (params, req, user) {
        const trx = await db.beginTransaction()
        const mr = await LogMaterialRequest.query().where('id', params.id).last()

        req.site_id = mr.site_id

        let itemsType = []
        for (const obj of req.items) {
            if(obj.barang_id){
                const barang = await Barang.query().where('id', obj.barang_id).last()
                itemsType.push({
                    ...obj, 
                    type: barang.equiptype,
                    kode: barang.kode,
                    partnumber: barang.partnumber,
                    descriptions: barang.descriptions,
                    uom: barang.uom
                })
            }
        }

        itemsType = _.groupBy(itemsType, 'type')
        itemsType = Object.keys(itemsType).map(key => {
            return {
                type: key,
                items: itemsType[key]
            }
        })
        // console.log(itemsType);
        
        for (const obj of itemsType) {
            const groupType = await MamPurchasingCategory.query().where('type', obj.type).last()
            const kode = await utils.GEN_KODE_PURCHASING_ORDER(req.site_id)
            const mamPurchasingRequest = new MamPurchasingRequest()
            mamPurchasingRequest.fill({
                mr_id: params.id,
                kode: kode,
                date: new Date(),
                site_id: mr.site_id,
                group_view: groupType.usertype,
                department: mr.department_id,
                priority: 'URGENT PRIORITY',
                createdby: user.id,
                description: 'Purchasing Request base on material request kode : '+mr.kode
            })
            try {
                await mamPurchasingRequest.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed save purchasing request...'
                }
            }

            for (const val of obj.items) {
                const mamPurchasingRequestItem = new MamPurchasingRequestItem()
                mamPurchasingRequestItem.fill({
                    mr_id: params.id,
                    request_id: mamPurchasingRequest.id,
                    barang_id: val.barang_id,
                    equipment_id: val.equipment_id || null,
                    kode: val.kode,
                    partnumber: val.partnumber,
                    descriptions: val.descriptions,
                    satuan: val.uom,
                    qty: val.qty
                })
                try {
                    await mamPurchasingRequestItem.save(trx)
                } catch (error) {
                    console.log(error);
                    await trx.rollback()
                    return {
                        success: false,
                        message: 'Failed save purchasing request items...'
                    }
                }
            }

            for (const val of obj.items) {
                const materialrequestItems = await LogMaterialRequestItem.query().where( w => {
                    w.where('material_req_id', params.id)
                    w.where('barang_id', val.barang_id)
                    w.where('aktif', 'Y')
                }).last()

                materialrequestItems.merge({qty_order: materialrequestItems.qty_order + parseFloat(val.qty)})
                try {
                    await materialrequestItems.save(trx)
                } catch (error) {
                    console.log(error);
                    await trx.rollback()
                    return {
                        success: false,
                        message: 'Failed update material request items...'
                    }
                }
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success save purchasing request...'
        }
        
    }
}

module.exports = new mamMaterialRequestCheck()