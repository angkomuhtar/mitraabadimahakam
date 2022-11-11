'use strict'
const db = use('Database')
const _ = require('underscore')
const moment = require('moment')
const Barang = use("App/Models/MasBarang")
const MamBarangIn = use("App/Models/MamBarangIn")
const MamBarangOut = use("App/Models/MamBarangOut")
const MamBarangStok = use("App/Models/MamBarangStok")
// const PurchasingOrder = use("App/Models/MamPurchasingOrder")
// const PurchasingOrderItem = use("App/Models/MamPurchasingOrderItem")
// const PurchasingRequest = use("App/Models/MamPurchasingRequest")
// const PurchasingRequestItem = use("App/Models/MamPurchasingRequestItem")


class stockMonitoring {
    async LIST (req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const stok = await MamBarangStok.query()
        .with('barang')
        .with('gudang')
        .where( w  => {
            if(req.cabang_id){
                w.where('cabang_id', req.cabang_id)
            }
            if(req.barang_id){
                w.where('barang_id', req.barang_id)
            }
        }).paginate(halaman, limit)

        let barang = stok.toJSON()

        return barang
    }

    async HISTORY_IN (params, req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const data = (
            await MamBarangIn.query()
            .with('purchasingRequest')
            .with('gudang')
            .with('barang')
            .with('author')
            .where( w => {
                w.where('barang_id', params.id)
                w.where('gudang_id', params.gudang_id)
            }).paginate(halaman, limit)
        ).toJSON()

        return data
    }

    async HISTORY_OUT (params, req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const data = (
            await MamBarangOut.query()
            .with('materialRequest')
            .with('gudang')
            .with('barang')
            .with('author')
            .where( w => {
                w.where('barang_id', params.id)
                w.where('gudang_id', params.gudang_id)
            }).paginate(halaman, limit)
        ).toJSON()

        return data
    }
    
    async SHOW (params) {
        const purchasingOrder = await PurchasingOrder.query()
        .with('items', i => {
            i.with('barang')
            i.with('equipment')
        })
        .where('id', params.id).last()
        return purchasingRequest.toJSON()
    }

    async POST (req, user) {

        const trx = await db.beginTransaction()

        const purcRequest = await PurchasingRequest.query().where('id', req.request_id).last()
        req.mr_id = purcRequest.mr_id
        req.site_id = purcRequest.site_id
        req.gudang_id = purcRequest.gudang_id

        

        let groupVendor = _.groupBy(req.items, 'vendor_id')
        groupVendor = Object.keys(groupVendor).map(key => {
            return {
                vendor_id: key,
                items: groupVendor[key]
            }
        })
        
        for (const obj of groupVendor) {
            const purchasingOrder = new PurchasingOrder()
            purchasingOrder.fill({
                mr_id: req.mr_id,
                site_id: req.site_id,
                gudang_id: req.gudang_id,
                request_id: req.request_id,
                vendor_id: obj.vendor_id,
                kode: 'TEMP'+moment().format('DDMMYYHHmmss'),
                date: new Date(),
                narasi: req.narasi || 'Tanpa keterangan tambahan',
                created_by: user.id
            })

            try {
                await purchasingOrder.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed save purchasing order...'
                }
            }
            for (const val of obj.items) {
                const purchasingOrderItem = new PurchasingOrderItem()
                purchasingOrderItem.fill({
                    order_id: purchasingOrder.id,
                    barang_id: val.barang_id,
                    replace_with: val.replace_with || null,
                    equipment_id: val.equipment_id || null,
                    qty: val.qty,
                    status: 'waiting'
                })

                try {
                    await purchasingOrderItem.save(trx)
                } catch (error) {
                    console.log(error);
                    await trx.rollback()
                    return {
                        success: false,
                        message: 'Failed save purchasing order items...'
                    }
                }
            }
        }

        try {
            purcRequest.merge({status: 'accept', acceptby: user.id, acceptAt: new Date()})
            await purcRequest.save(trx)
        } catch (error) {
            console.log(error);
            await trx.rollback()
            return {
                success: false,
                message: 'Failed update purchasing request...'
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success save Purchasing Requesting,,,'
        }
    }
}

module.exports = new stockMonitoring()