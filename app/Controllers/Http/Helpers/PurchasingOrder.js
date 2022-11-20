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
        .with('pr')
        .with('vendor')
        .with('gudang')
        .with('items')
        .where( w  => {
            if (req.kode) {
                w.where('kode', req.kode)
            }
        }).orderBy([{column: 'date', order: 'desc'}, {column: 'kode', order: 'asc'}]).paginate(halaman, limit)
        return purchasingOrder.toJSON()
    }
    
    async SHOW (params) {
        const purchasingOrder = await PurchasingOrder.query()
        .with('pr')
        .with('vendor')
        .with('gudang')
        .with('items', i => {
            i.with('barang')
            i.with('barang_alt')
            i.with('equipment')
            i.where('aktif', 'Y')
        }).where('id', params.id).last()

        return purchasingOrder.toJSON()
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

    async UPDATE (params, req, user) {
        const trx = await db.beginTransaction()

        for (const obj of req.items) {
            const items = await PurchasingOrderItem.query().where('id', obj.id).last()
            items.merge({
                est_received: obj.est_received || null,
                qty: obj.qty
            })

            try {
                await items.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed update purchasing order items...'
                }
            }
        }

        const purchasingOrder = await PurchasingOrder.query().where('id', params.id).last()
        purchasingOrder.merge({
            kode: req.kode,
            narasi: req.narasi || null,
            status: req.status
        })
        try {
            await purchasingOrder.save(trx)
        } catch (error) {
            console.log(error);
            await trx.rollback()
            return {
                success: false,
                message: 'Failed update purchasing order...'
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success update Purchasing order,,,'
        }
    }

    async RECEIVED (params, req, user) {
        const trx = await db.beginTransaction()

        const purchasingOrder = await PurchasingOrder.query().where('id', params.id).last()
        purchasingOrder.merge({
            status: req.status
        })

        try {
            await purchasingOrder.save(trx)
        } catch (error) {
            console.log(error);
            await trx.rollback()
            return {
                success: false,
                message: 'Failed update purchasing order...'
            }
        }

        // console.log(req);
        for (const obj of req.items) {
            const items = await PurchasingOrderItem.query().where('id', obj.id).last()
            console.log((items.receive + parseFloat(obj.receive)));
            console.log(items.qty);
            if((items.receive + parseFloat(obj.receive)) > items.qty){
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed update purchasing order, \ninput received lebih besar dari qty order...'
                }
            }

            items.merge({
                receive: items.receive + parseFloat(obj.receive)
            })

            try {
                await items.save(trx)
            } catch (error) {
                console.log(error);
                await trx.rollback()
                return {
                    success: false,
                    message: 'Failed update purchasing order items...'
                }
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success update Purchasing order,,,'
        }
    }

    async DELIVERED (params, req, user) {
        const trx = await db.beginTransaction()

        const purchasingOrder = await PurchasingOrder.query().where('id', params.id).last()
        purchasingOrder.merge({
            status: req.status,
            spj: req.spj,
            delman: req.delman
        })

        try {
            await purchasingOrder.save(trx)
        } catch (error) {
            console.log(error);
            await trx.rollback()
            return {
                success: false,
                message: 'Failed update purchasing order...'
            }
        }

        /** UPDATE ITEM PURCHASING REQUEST JIKA ADA REPLACEMNET ITEMS **/
        const request_id = purchasingOrder.request_id

        const purchasingOrderItem = (
            await PurchasingOrderItem.query().where( w => {
                w.where('order_id', params.id)
                w.where('aktif', 'Y')
            }).fetch()
        ).toJSON()

        for (const obj of purchasingOrderItem) {
            const purchasingRequestItem = await PurchasingRequestItem.query().where( w => {
                w.where('aktif', 'Y')
                w.where('request_id', request_id)
                w.where('barang_id', obj.barang_id)
            }).last()

            if(purchasingRequestItem){
                purchasingRequestItem.merge({
                    replace_with: obj.replace_with || null
                })
                try {
                    await purchasingRequestItem.save(trx)
                } catch (error) {
                    await trx.rollback()
                    return {
                        success: false,
                        message: 'Failed update replacement order items...'
                    }
                }
            }
        }

        await trx.commit()
        return {
            success: true,
            message: 'Success update Purchasing order,,,'
        }
    }

    async DELETE_ITEMS (params) {
        const purchasingOrderItem = await PurchasingOrderItem.query().where('id', params.id).last()
        purchasingOrderItem.merge({aktif: 'N'})
        try {
            await purchasingOrderItem.save()
        } catch (error) {
            return {
                success: false,
                message: 'Failed delete purchasing order items...'
            }
        }

        return {
            success: true,
            message: 'Success delete Purchasing order items,,,'
        }
    }
}

module.exports = new mamPurchasingOrder()