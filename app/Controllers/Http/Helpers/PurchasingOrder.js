'use strict'
const db = use('Database')
const _ = require('underscore')
const moment = require('moment')
const Barang = use("App/Models/MasBarang")
const PurchasingOrder = use("App/Models/MamPurchasingOrder")
const PurchasingOrderItem = use("App/Models/MamPurchasingOrderItem")
const PurchasingRequest = use("App/Models/MamPurchasingRequest")
const PurchasingRequestItem = use("App/Models/MamPurchasingRequestItem")


class mamPurchasingOrder {
    async LIST (req) {
        const limit = req.limit || 25
        const halaman = req.page === undefined ? 1 : parseInt(req.page)
        const purchasingOrder = await PurchasingOrder.query()
        .with('items')
        .where( w  => {
            if (req.kode) {
                w.where('kode', req.kode)
            }
            if (req.department) {
                w.where('department', req.department)
            }
            if (req.type) {
                w.where('type', req.type)
            }
            if (req.priority) {
                w.where('priority', priority)
            }
        }).orderBy([{column: 'date', order: 'desc'}, {column: 'kode', order: 'asc'}]).paginate(halaman, limit)
        return purchasingOrder.toJSON()
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

module.exports = new mamPurchasingOrder()